"""Pipeline: draft a formal complaint email body using Llama-3 given CaseFile + VerifyResult."""
"""Draft step: approved CaseFile + verify + score -> complaint email.

The AI writes the wording; Python owns the facts. If the AI fails, a template is used.
"""
from datetime import datetime
import logging
from typing import Optional

from pipeline.verify import find_policies
from router import reason
from schemas import CaseFile, Draft, DraftLLM, ScoreResult, VerifyResult

log = logging.getLogger("draft")

ASK = {
    "return": "a return and full refund",
    "replacement": "a replacement of the product",
    "warranty": "a free repair or replacement under the manufacturer's warranty",
    "consumer_helpline": "a refund or replacement, as the product has a manufacturing defect",
}
RECIPIENT = {
    "return": "the seller's customer support team",
    "replacement": "the seller's customer support team",
    "warranty": "the brand's customer support / service team",
    "consumer_helpline": "the company's grievance officer (copy to the National Consumer Helpline)",
}

DRAFT_SYSTEM = """You write formal consumer complaint emails for Indian customers.
Style: polite, firm, clear. Plain English. 150-220 words. No markdown, no bullet symbols.
Structure: greeting, one paragraph stating the purchase facts, one paragraph describing the defect,
one paragraph stating the request and referring to the policy, closing with a 7-day response request.
Mention that photo evidence and the invoice are attached.
Use ONLY the facts provided. Never invent names, dates, amounts or order IDs.
Never add claims the customer did not make: nothing about delivery condition, packaging,
satisfaction, or how the damage happened (e.g. "no mishandling"). Do not add filler sentences.
Sign off with exactly:
Regards,
[Your Name]
[Your Phone]
Return a subject line and the body."""


def _pick_policy(route: str, pol: dict) -> dict:
    if route in ("return", "replacement"):
        return pol["platform"] or pol["default"]
    if route == "warranty":
        return pol["brand"] or pol["default"]
    return pol["default"]


def _facts(cf: CaseFile) -> dict:
    return {
        "product": cf.product.value, "brand": cf.brand.value, "color": cf.color.value,
        "variant": cf.variant.value, "order_id": cf.order_id.value,
        "purchase_date": cf.purchase_date.value, "price_inr": cf.price.value,
        "seller": cf.seller.value, "platform": cf.platform.value,
        "defect": cf.defect_type.value, "defect_details": cf.defect_description.value,
        "customer_complaint": cf.complaint_summary.value,
    }


def _facts_block(f: dict) -> str:
    lines = [("Order ID", f["order_id"]), ("Product", f["product"]), ("Purchase date", f["purchase_date"]),
             ("Amount paid", f"Rs. {f['price_inr']}" if f["price_inr"] else None), ("Seller", f["seller"])]
    return "\n".join(f"{k}: {v}" for k, v in lines if v)


def _template(f: dict, route: str, clause: str) -> DraftLLM:
    """Deterministic fallback when both AI providers fail."""
    product = f["product"] or "the product"
    subject = f"Complaint: defective {product}" + (f" - Order {f['order_id']}" if f["order_id"] else "")
    body = (
        "Dear Customer Support Team,\n\n"
        f"I am writing about {product} that I purchased"
        + (f" on {f['purchase_date']}" if f["purchase_date"] else "")
        + (f" (Order ID: {f['order_id']})" if f["order_id"] else "") + ".\n\n"
        f"The product is defective: {f['defect_details'] or f['defect'] or 'it does not work as expected'}. "
        + (f"{f['customer_complaint']}. " if f["customer_complaint"] else "")
        + "Photo evidence and the invoice are attached.\n\n"
        f"I request {ASK[route]}. {clause}\n\n"
        "Please resolve this within 7 days.\n\n"
        "Regards,\n[Your Name]\n[Your Phone]"
    )
    return DraftLLM(subject=subject, body=body)


def _date_in_text(iso: str, text: str) -> bool:
    """True if the date appears in any common written form."""
    try:
        d = datetime.strptime(iso, "%Y-%m-%d")
    except ValueError:
        return iso in text
    forms = {iso, d.strftime("%d/%m/%Y"), d.strftime("%d-%m-%Y"),
             f"{d.day} {d.strftime('%B %Y')}", f"{d.day} {d.strftime('%b %Y')}",
             d.strftime("%d %B %Y"), f"{d.strftime('%B')} {d.day}, {d.year}"}
    return any(f in text for f in forms)


async def draft_complaint(cf: CaseFile, vr: VerifyResult, sr: ScoreResult) -> Draft:
    pol = find_policies(cf)
    policy = _pick_policy(sr.route, pol)
    clause = policy.get("clause") or ""
    f = _facts(cf)

    prompt = (
        f"Write to: {RECIPIENT[sr.route]}\n"
        f"Request: {ASK[sr.route]}\n"
        f"Policy to refer to: {clause}\n"
        f"Days since purchase: {vr.days_since_purchase}\n"
        f"Facts: {f}\n"
        "Skip any fact that is None."
    )
    try:
        out = await reason(DRAFT_SYSTEM, prompt, DraftLLM)
    except Exception as e:
        log.warning("AI draft failed, using template: %s", e)
        out = _template(f, sr.route, clause)

    subject, body = out.subject.strip(), out.body.strip()

    # Python owns the facts: make sure the key ones are actually in the email
    missing = []
    if f["order_id"] and f["order_id"] not in body:
        missing.append("order_id")
    if f["purchase_date"] and not _date_in_text(f["purchase_date"], body):
        missing.append("purchase_date")
    if missing:
        body += "\n\nOrder details:\n" + _facts_block(f)
    if f["order_id"] and f["order_id"] not in subject:
        subject = f"{subject} - Order {f['order_id']}"
    if "[Your Name]" not in body:
        body += "\n\nRegards,\n[Your Name]\n[Your Phone]"

    to_email: Optional[str] = policy.get("support_email") or None
    return Draft(subject=subject, body=body, to_email=to_email,
                 policy_clause=clause, policy_source=policy.get("source_url"))