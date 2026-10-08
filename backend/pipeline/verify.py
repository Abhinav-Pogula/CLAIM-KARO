"""Pipeline: verify CaseFile — date rules, warranty window, Llama-3 cross-check, return VerifyResult."""
"""Verify step: rules (exact, Python) + AI cross-check (semantic, Groq/Gemini).

verify(case_file, raw) -> VerifyResult
  raw = latest extraction outputs per source, e.g. {"photo": {...}, "voice": {...}, "invoice": {...}}
        (loaded from case_events by the route; may be partial or empty).

Rule flags never depend on the AI. The AI only adds contradictions the rules can't see.
"""
import json
import logging
import re
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Optional

from pipeline.fuse import same_value
from router import reason
from schemas import CASEFILE_FIELDS, CaseFile, CrossCheckResult, Flag, VerifyResult

log = logging.getLogger("verify")

POLICY_FILE = Path(__file__).resolve().parent.parent / "data" / "policies.json"
DAYS_PER_MONTH = 30.44
DEFAULT_RETURN_DAYS = 7
DEFAULT_WARRANTY_MONTHS = 12
RULE_HANDLED_CODES = {"return_window_expired", "warranty_expired", "missing_purchase_date",
                      "future_purchase_date", "missing_order_id"}


# ---------- policies ----------

@lru_cache(maxsize=1)
def load_policies() -> dict:
    with open(POLICY_FILE, encoding="utf-8") as f:
        data = json.load(f)
    return {k: v for k, v in data.items() if not k.startswith("_meta")}


def _matches(policy: dict, haystack: str) -> bool:
    return any(re.search(rf"\b{re.escape(a.lower())}\b", haystack) for a in policy.get("aliases", []))


def find_policies(cf: CaseFile) -> dict:
    """Returns {"platform": policy|None, "brand": policy|None, "default": policy,
                "return_days": int, "warranty_months": int, "label": str}"""
    policies = load_policies()
    default = policies.get("_default", {})
    haystack = " ".join(filter(None, [cf.platform.value, cf.seller.value, cf.brand.value,
                                      cf.product.value])).lower()
    platform = next((p for k, p in policies.items()
                     if p.get("type") == "platform" and _matches(p, haystack)), None)
    brand = next((p for k, p in policies.items()
                  if p.get("type") == "brand" and _matches(p, haystack)), None)

    return_days = (platform or {}).get("return_days") or default.get("return_days") or DEFAULT_RETURN_DAYS
    warranty_months = ((brand or {}).get("warranty_months") or default.get("warranty_months")
                       or DEFAULT_WARRANTY_MONTHS)
    label = (brand or platform or default).get("name", "Generic seller")
    return {"platform": platform, "brand": brand, "default": default,
            "return_days": int(return_days), "warranty_months": int(warranty_months), "label": label}


# ---------- rule checks ----------

def _parse_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def _rule_flags(cf: CaseFile, raw: dict, pol: dict, result: VerifyResult) -> list[Flag]:
    flags: list[Flag] = []

    # dates
    bought = _parse_date(cf.purchase_date.value)
    if not bought:
        flags.append(Flag(code="missing_purchase_date", severity="blocking", source="rule",
                          message="Purchase date is missing or unreadable, so the return window "
                                  "and warranty can't be checked.", fields=["purchase_date"]))
    else:
        days = (date.today() - bought).days
        result.days_since_purchase = days
        if days < 0:
            flags.append(Flag(code="future_purchase_date", severity="blocking", source="rule",
                              message=f"Purchase date {bought.isoformat()} is in the future.",
                              fields=["purchase_date"]))
        else:
            result.within_return_window = days <= pol["return_days"]
            warranty_days = round(pol["warranty_months"] * DAYS_PER_MONTH)
            result.within_warranty = days <= warranty_days
            if not result.within_return_window:
                over = days - pol["return_days"]
                flags.append(Flag(code="return_window_expired", severity="warning", source="rule",
                                  message=f"The {pol['return_days']}-day return window ended {over} "
                                          f"day{'s' if over != 1 else ''} ago. A return isn't possible, "
                                          f"but other routes may be.",
                                  fields=["purchase_date"]))
            if not result.within_warranty:
                over = days - warranty_days
                flags.append(Flag(code="warranty_expired", severity="blocking", source="rule",
                                  message=f"The {pol['warranty_months']}-month warranty ended {over} "
                                          f"days ago. The consumer helpline is the remaining route.",
                                  fields=["purchase_date"]))

    # identity
    if not cf.order_id.value:
        flags.append(Flag(code="missing_order_id", severity="warning", source="rule",
                          message="No order or invoice number found. Companies usually ask for it.",
                          fields=["order_id"]))

    # defect evidence
    if not cf.defect_type.value or cf.defect_type.source != "photo" or cf.defect_type.confidence < 0.5:
        flags.append(Flag(code="defect_not_visible", severity="warning", source="rule",
                          message="The photo doesn't clearly show the defect. A clearer photo "
                                  "makes the claim much stronger.",
                          fields=["defect_type"]))

    if not cf.desired_outcome.value:
        flags.append(Flag(code="outcome_not_stated", severity="info", source="rule",
                          message="You didn't say whether you want a refund, replacement or repair. "
                                  "We'll pick the best option for you.",
                          fields=["desired_outcome"]))

    # photo vs final values (catches mismatches even after user edits)
    photo = raw.get("photo") or {}
    for field in ("color", "product", "brand"):
        final_val = getattr(cf, field).value
        photo_val = photo.get(field)
        if same_value(final_val, photo_val) is False:
            flags.append(Flag(code=f"{field}_mismatch", severity="warning", source="rule",
                              message=f"The case says {field} is \"{final_val}\", but the photo "
                                      f"shows \"{photo_val}\". Make sure the photo is of this product.",
                              fields=[field]))
    return flags


# ---------- AI cross-check ----------

CROSS_CHECK_SYSTEM = """You are a claims investigator checking a consumer complaint for contradictions
between three pieces of evidence: what the PHOTO shows, what the INVOICE says, and what the customer
SAID in a voice note. You also get the final case file the customer approved.

Report ONLY real contradictions or red flags, for example:
- the spoken complaint describes a different problem than the photo shows
- the product in the photo is a different type of product than the invoice
- the damage looks like physical misuse (dropped, water) while the customer claims a manufacturing defect
- invoice details look inconsistent (price absurd for the product, etc.)

Do NOT report: dates, return windows, warranty, missing order IDs, or color/brand mismatches
(these are checked separately). Do not invent problems. If everything is consistent, return no flags.
Maximum 3 flags. code is short snake_case. severity: "warning" for likely problems,
"info" for minor notes. fields lists the case file field names involved."""


_FIELD_ALIASES = {"transcript": "complaint_summary", "complaint": "complaint_summary",
                  "defect": "defect_type", "date": "purchase_date", "amount": "price"}


def _clean_fields(fields: list[str]) -> list[str]:
    """'voice_said.transcript' -> 'complaint_summary'; drop anything that isn't a CaseFile field."""
    out = []
    for f in fields:
        name = str(f).split(".")[-1].strip().lower()
        name = _FIELD_ALIASES.get(name, name)
        if name in CASEFILE_FIELDS and name not in out:
            out.append(name)
    return out


async def _ai_flags(cf: CaseFile, raw: dict) -> list[Flag]:
    facts = {
        "case_file": {k: v.get("value") if isinstance(v, dict) else v
                      for k, v in cf.model_dump().items() if k != "defect_box"},
        "photo_said": raw.get("photo"),
        "invoice_said": raw.get("invoice"),
        "voice_said": {k: (raw.get("voice") or {}).get(k)
                       for k in ("transcript", "complaint_summary", "desired_outcome")},
    }
    try:
        res = await reason(CROSS_CHECK_SYSTEM, json.dumps(facts, ensure_ascii=False, default=str),
                           CrossCheckResult)
    except Exception as e:
        log.warning("AI cross-check skipped: %s", e)
        return []
    out = []
    for f in res.flags[:3]:
        if f.code in RULE_HANDLED_CODES or f.code.endswith("_mismatch"):
            continue
        out.append(Flag(code=f.code, severity=f.severity, message=f.message,
                        fields=_clean_fields(f.fields), source="ai"))
    return out


# ---------- main ----------

def _dedupe(flags: list[Flag]) -> list[Flag]:
    seen, out = set(), []
    for f in flags:
        if f.code not in seen:
            seen.add(f.code)
            out.append(f)
    order = {"blocking": 0, "warning": 1, "info": 2}
    return sorted(out, key=lambda f: order.get(f.severity, 3))


async def verify(cf: CaseFile, raw: Optional[dict] = None) -> VerifyResult:
    raw = raw or {}
    pol = find_policies(cf)
    result = VerifyResult(policy_brand=pol["label"])
    rule_flags = _rule_flags(cf, raw, pol, result)
    ai_flags = await _ai_flags(cf, raw)
    result.flags = _dedupe(rule_flags + ai_flags)
    return result