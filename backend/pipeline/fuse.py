"""Pipeline: merge PhotoResult + VoiceResult + InvoiceResult into a unified CaseFile."""
"""Fuse step: photo + voice + invoice results -> one CaseFile.

Pure Python, no AI calls. Every field records where it came from and how sure we are.
Rules:
- order_id, purchase_date, price, seller, platform, variant  <- invoice
- defect_type, defect_description, defect_box                 <- photo (voice as fallback)
- complaint_summary, desired_outcome, transcript              <- voice
- product, brand, color  <- invoice preferred, photo fallback.
  If both exist and disagree: keep invoice value, confidence drops to CONFLICT_CONFIDENCE.
"""
import re
from typing import Optional

from schemas import (CASEFILE_FIELDS, CaseField, CaseFile, InvoiceResult,
                     PhotoResult, VoiceResult)

CONFLICT_CONFIDENCE = 0.4
LOW_CONFIDENCE = 0.6          # UI highlights fields below this
NO_DEFECT_WORDS = ("no visible defect", "no defect", "none visible", "not visible")

_SYNONYMS = {"gray": "grey", "colour": "color", "earphones": "earbuds",
             "headphones": "earbuds", "buds": "earbuds", "mobile": "phone",
             "smartphone": "phone", "cellphone": "phone"}
_STOPWORDS = {"the", "a", "an", "and", "with", "of", "for", "new", "pro", "edition"}


# ---------- comparison helpers (reused by verify) ----------

def _tokens(text: Optional[str]) -> set[str]:
    if not text:
        return set()
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {_SYNONYMS.get(w, w) for w in words if w not in _STOPWORDS}


def same_value(a: Optional[str], b: Optional[str]) -> Optional[bool]:
    """True if a and b plausibly describe the same thing, False if they clearly differ,
    None if either side is missing (can't compare)."""
    if not a or not b:
        return None
    ta, tb = _tokens(a), _tokens(b)
    if not ta or not tb:
        return None
    if ta & tb:                      # share any meaningful word
        return True
    la, lb = a.lower(), b.lower()
    return la in lb or lb in la


def _field(value: Optional[str], source: str, confidence: float) -> CaseField:
    if value is None:
        return CaseField(value=None, source=source, confidence=0.0)
    return CaseField(value=str(value), source=source, confidence=confidence)


def _prefer_invoice(inv_val, inv_conf, photo_val, photo_conf) -> CaseField:
    """Invoice wins. Photo fills gaps. Disagreement lowers confidence."""
    if inv_val and photo_val:
        if same_value(inv_val, photo_val) is False:
            return _field(inv_val, "invoice", CONFLICT_CONFIDENCE)
        return _field(inv_val, "invoice", max(inv_conf, photo_conf))
    if inv_val:
        return _field(inv_val, "invoice", inv_conf)
    if photo_val:
        return _field(photo_val, "photo", photo_conf)
    return _field(None, "system", 0.0)


# ---------- main ----------

def fuse(photo: Optional[PhotoResult],
         voice: Optional[VoiceResult],
         invoice: Optional[InvoiceResult]) -> CaseFile:
    p = photo or PhotoResult(confidence=0)
    v = voice or VoiceResult(confidence=0)
    i = invoice or InvoiceResult(confidence=0)

    cf = CaseFile()

    # invoice-owned fields
    for name in ("order_id", "purchase_date", "price", "seller", "platform", "variant"):
        setattr(cf, name, _field(getattr(i, name), "invoice", i.confidence))

    # shared fields: invoice preferred, photo fallback, conflict lowers confidence
    cf.product = _prefer_invoice(i.product, i.confidence, p.product, p.confidence)
    cf.brand = _prefer_invoice(i.brand, i.confidence, p.brand, p.confidence)
    cf.color = _prefer_invoice(i.color, i.confidence, p.color, p.confidence)

    # defect: photo first, voice summary as fallback
    photo_shows_defect = bool(p.defect_type) and not any(
        w in p.defect_type.lower() for w in NO_DEFECT_WORDS)
    if photo_shows_defect:
        cf.defect_type = _field(p.defect_type, "photo", p.confidence)
        cf.defect_description = _field(p.defect_description, "photo", p.confidence)
        cf.defect_box = p.box_2d
    else:
        # photo missing or shows nothing: lean on what the customer said, at low confidence
        cf.defect_type = _field(p.defect_type, "photo", min(p.confidence, 0.3)) if p.defect_type \
            else _field(None, "system", 0.0)
        cf.defect_description = _field(v.complaint_summary, "voice", min(v.confidence, 0.5))
        cf.defect_box = None

    # voice-owned fields
    cf.complaint_summary = _field(v.complaint_summary, "voice", v.confidence)
    if v.desired_outcome == "unknown":
        cf.desired_outcome = _field(None, "voice", 0.0)
    else:
        cf.desired_outcome = _field(v.desired_outcome, "voice", v.confidence)
    cf.transcript = v.transcript or ""

    return cf


# ---------- helpers for the API ----------

def apply_updates(cf: CaseFile, updates: dict[str, Optional[str]]) -> CaseFile:
    """User edits from the Review screen. Edited fields become source=user, confidence=1."""
    data = cf.model_copy(deep=True)
    for name, value in updates.items():
        if name not in CASEFILE_FIELDS:
            continue
        value = value.strip() if isinstance(value, str) else value
        setattr(data, name, CaseField(value=value or None, source="user",
                                      confidence=1.0 if value else 0.0))
    return data


def low_confidence_fields(cf: CaseFile, threshold: float = LOW_CONFIDENCE) -> list[str]:
    """Field names the UI should highlight yellow."""
    return [n for n in CASEFILE_FIELDS if getattr(cf, n).confidence < threshold]