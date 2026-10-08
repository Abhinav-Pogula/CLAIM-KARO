"""Send the complaint email through Resend, with evidence attached.

EMAIL_SAFE_MODE=true (default): every email goes to DEMO_RECIPIENT, never to a real company.
The intended recipient is shown at the top of the email so the demo still makes sense.
"""
import base64
import html
import logging
from email.utils import parseaddr
from typing import Optional

import httpx
import resend

from config import settings

log = logging.getLogger("email")


class EmailError(Exception):
    """Raised when the email can't be sent; message is safe to show the user."""


def _html_body(body: str, intended_to: Optional[str], safe: bool) -> str:
    banner = ""
    if safe:
        banner = (
            '<div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;'
            'padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400E">'
            f"<b>ClaimKaro demo mode.</b> In production this would be sent to: "
            f"<b>{html.escape(intended_to or 'the company support address')}</b></div>"
        )
    paragraphs = "".join(
        f'<p style="margin:0 0 14px">{html.escape(p).replace(chr(10), "<br>")}</p>'
        for p in body.split("\n\n") if p.strip()
    )
    return (
        '<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;'
        'color:#0F172A;max-width:640px">'
        f"{banner}{paragraphs}"
        '<hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0 10px">'
        '<p style="font-size:12px;color:#64748B;margin:0">Sent with ClaimKaro - '
        "evidence verified by AI, approved by the customer.</p></div>"
    )


def _send_resend(params: dict) -> Optional[str]:
    if not settings.resend_api_key:
        raise EmailError("Email is not configured (RESEND_API_KEY missing).")
    resend.api_key = settings.resend_api_key
    try:
        result = resend.Emails.send(params)
    except Exception as e:
        msg = str(e)
        if "only send testing emails" in msg.lower() or "verify a domain" in msg.lower():
            raise EmailError("Resend can only deliver to your own account email until a domain is "
                             "verified. Use EMAIL_PROVIDER=brevo to deliver to any inbox.") from e
        raise EmailError(f"Email could not be sent: {msg}") from e
    return result.get("id") if isinstance(result, dict) else getattr(result, "id", None)


def _send_brevo(params: dict, attachments: list[tuple[str, bytes]]) -> Optional[str]:
    """Brevo transactional API over HTTPS (works on Render free tier, which blocks SMTP)."""
    if not settings.brevo_api_key:
        raise EmailError("Email is not configured (BREVO_API_KEY missing).")
    name, address = parseaddr(settings.email_from)
    payload = {
        "sender": {"name": name or "ClaimKaro", "email": address},
        "to": [{"email": params["to"][0]}],
        "subject": params["subject"],
        "htmlContent": params["html"],
        "textContent": params["text"],
    }
    if params.get("reply_to"):
        payload["replyTo"] = {"email": params["reply_to"]}
    files = [{"name": n, "content": base64.b64encode(d).decode()} for n, d in attachments if d]
    if files:
        payload["attachment"] = files
    try:
        r = httpx.post("https://api.brevo.com/v3/smtp/email", json=payload, timeout=30,
                       headers={"api-key": settings.brevo_api_key, "accept": "application/json"})
    except httpx.HTTPError as e:
        raise EmailError(f"Email service unreachable: {e}") from e
    if r.status_code >= 400:
        try:
            detail = r.json().get("message", r.text)
        except ValueError:
            detail = r.text
        if "sender" in str(detail).lower():
            detail += " (verify the EMAIL_FROM address as a sender in Brevo)"
        raise EmailError(f"Email could not be sent: {detail}")
    return r.json().get("messageId")


def send_complaint(
    intended_to: Optional[str],
    subject: str,
    body: str,
    attachments: list[tuple[str, bytes]],
    reply_to: Optional[str] = None,
    deliver_to: Optional[str] = None,
) -> dict:
    """Send the complaint. attachments = [(filename, bytes), ...].
    Safe mode: delivered to deliver_to (the user's demo merchant inbox) or DEMO_RECIPIENT.
    Returns {"id", "to", "intended_to", "safe_mode"}. Raises EmailError."""
    safe = settings.email_safe_mode
    to = (deliver_to or settings.demo_recipient) if safe else intended_to
    if not to:
        raise EmailError("No inbox to deliver to. Set your demo merchant inbox first.")
    if not subject.strip() or not body.strip():
        raise EmailError("Subject and body can't be empty.")

    text_body = body
    if safe:
        text_body = (f"[ClaimKaro demo mode - intended recipient: {intended_to or 'company support'}]\n\n"
                     + body)
    params: dict = {
        "from": settings.email_from,
        "to": [to],
        "subject": subject,
        "text": text_body,
        "html": _html_body(body, intended_to, safe),
        "attachments": [{"filename": n, "content": list(d)} for n, d in attachments if d],
    }
    if reply_to:
        params["reply_to"] = reply_to

    provider = (settings.email_provider or "resend").lower()
    try:
        email_id = _send_brevo(params, attachments) if provider == "brevo" else _send_resend(params)
    except EmailError:
        log.exception("email failed via %s", provider)
        raise
    log.info("email sent via %s id=%s to=%s (intended %s, safe=%s)", provider, email_id, to, intended_to, safe)
    return {"id": email_id, "to": to, "intended_to": intended_to, "safe_mode": safe}
