"""Action routes: send complaint email, submit to portal, generate PDF from template."""
"""Action routes: the agent acts on an approved, drafted case.

POST /cases/{id}/actions/email     -> send complaint (needs confirm=true), status -> sent
GET  /cases/{id}/actions/portal    -> complaint page URL + prefilled fields to copy
GET  /cases/{id}/actions/template  -> complaint PDF download
"""
import logging
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from auth import get_current_user
from pipeline.draft import ASK, _pick_policy
from pipeline.verify import find_policies
from routes.cases import download_evidence, get_case, update_case
from routes.stream import _log_event
from schemas import CaseFile, Draft
from services.email import EmailError, send_complaint
from services.pdf import build_complaint_pdf

log = logging.getLogger("actions")
router = APIRouter(prefix="/cases", tags=["actions"])

DRAFTED_STATES = ("drafted", "sent")
NCH_URL = "https://consumerhelpline.gov.in"


class EmailAction(BaseModel):
    confirm: bool = False
    subject: Optional[str] = None       # edited subject from the Result screen
    body: Optional[str] = None          # edited body from the Result screen
    sender_name: Optional[str] = None
    sender_phone: Optional[str] = None


# ---------- helpers ----------

def _load_drafted(case_id: str, user_id: str) -> tuple[dict, CaseFile, Draft]:
    case = get_case(case_id, user_id)
    if case["status"] not in DRAFTED_STATES or not case.get("draft"):
        raise HTTPException(status_code=409,
                            detail=f"Run verification first. No complaint draft yet (status: '{case['status']}')")
    return case, CaseFile.model_validate(case["case_file"]), Draft(**case["draft"])


def _fill_placeholders(body: str, name: Optional[str], phone: Optional[str], fallback_name: str) -> str:
    body = body.replace("[Your Name]", (name or "").strip() or fallback_name)
    if phone and phone.strip():
        body = body.replace("[Your Phone]", phone.strip())
    else:
        body = re.sub(r"\n?\[Your Phone\]", "", body)
    return body


def _safe_filename(text: Optional[str]) -> str:
    return re.sub(r"[^A-Za-z0-9_-]+", "-", text or "case").strip("-")[:40] or "case"


# ---------- routes ----------

@router.post("/{case_id}/actions/email")
def action_email(case_id: str, body: EmailAction, user: dict = Depends(get_current_user)):
    if not body.confirm:
        raise HTTPException(status_code=400, detail="Please confirm before sending (confirm: true).")
    case, cf, draft = _load_drafted(case_id, user["id"])
    if case["status"] == "sent":
        sent = (case.get("draft") or {}).get("sent") or {}
        raise HTTPException(status_code=409,
                            detail=f"This complaint was already sent to {sent.get('to', 'the company')}.")

    subject = (body.subject or draft.subject).strip()
    text = _fill_placeholders(body.body or draft.body, body.sender_name, body.sender_phone,
                              fallback_name=user.get("email") or "Customer")

    files = download_evidence(case_id)
    attachments = []
    for kind, label in (("photo", "defect_photo"), ("invoice", "invoice")):
        if kind in files:
            data, filename, _mime = files[kind]
            ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
            attachments.append((f"{label}.{ext}", data))

    try:
        result = send_complaint(draft.to_email, subject, text, attachments, reply_to=user.get("email"))
    except EmailError as e:
        _log_event(case_id, "email", "error", {"error": str(e)})
        raise HTTPException(status_code=502, detail=str(e))

    sent_info = {**result, "at": datetime.now(timezone.utc).isoformat()}
    new_draft = {**case["draft"], "subject": subject, "body": text, "sent": sent_info}
    update_case(case_id, user["id"], {"draft": new_draft, "status": "sent"})
    _log_event(case_id, "email", "done", sent_info)
    return {"sent": True, **sent_info, "status": "sent"}


@router.get("/{case_id}/actions/portal")
def action_portal(case_id: str, user: dict = Depends(get_current_user)):
    case, cf, draft = _load_drafted(case_id, user["id"])
    route = case.get("route") or "consumer_helpline"
    policy = _pick_policy(route, find_policies(cf))
    url = NCH_URL if route == "consumer_helpline" else (policy.get("complaint_url") or NCH_URL)
    label = "National Consumer Helpline" if url == NCH_URL else policy.get("name", "Complaint page")

    description = " ".join(v for v in (cf.defect_description.value, cf.complaint_summary.value) if v)
    candidates = [
        ("Order ID", cf.order_id.value),
        ("Product", " ".join(v for v in (cf.brand.value, cf.product.value) if v) or None),
        ("Purchase date", cf.purchase_date.value),
        ("Amount paid", f"Rs. {cf.price.value}" if cf.price.value else None),
        ("Seller", cf.seller.value),
        ("Issue", cf.defect_type.value),
        ("Description", description or None),
        ("What you want", ASK.get(route)),
        ("Subject", draft.subject),
        ("Full complaint", draft.body),
    ]
    _log_event(case_id, "portal", "done", {"url": url})
    return {"url": url, "label": label, "route": route,
            "fields": [{"label": k, "value": v} for k, v in candidates if v]}


@router.get("/{case_id}/actions/template")
def action_template(case_id: str, user: dict = Depends(get_current_user)):
    case, cf, draft = _load_drafted(case_id, user["id"])
    try:
        pdf = build_complaint_pdf(cf, draft, case.get("score"), case.get("route"))
    except Exception as e:
        log.exception("pdf build failed")
        raise HTTPException(status_code=500, detail=f"Could not build the PDF: {e}")
    filename = f"ClaimKaro_complaint_{_safe_filename(cf.order_id.value)}.pdf"
    _log_event(case_id, "template", "done", {"filename": filename})
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})