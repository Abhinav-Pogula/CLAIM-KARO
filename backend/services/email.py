"""Service: send complaint emails via Resend API."""
"""Send the complaint email through Resend, with evidence attached.

EMAIL_SAFE_MODE=true (default): every email goes to DEMO_RECIPIENT, never to a real company.
The intended recipient is shown at the top of the email so the demo still makes sense.
"""
import html
import logging
from typing import Optional

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


def send_complaint(
    intended_to: Optional[str],
    subject: str,
    body: str,
    attachments: list[tuple[str, bytes]],
    reply_to: Optional[str] = None,
) -> dict:
    """Send the complaint. attachments = [(filename, bytes), ...].
    Returns {"id", "to", "intended_to", "safe_mode"}. Raises EmailError."""
    if not settings.resend_api_key:
        raise EmailError("Email is not configured (RESEND_API_KEY missing).")

    safe = settings.email_safe_mode
    to = settings.demo_recipient if safe else intended_to
    if not to:
        raise EmailError("No recipient email available. Set DEMO_RECIPIENT in .env "
                         "or add a support_email for this brand.")
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
        "attachments": [{"filename": name, "content": list(data)}
                        for name, data in attachments if data],
    }
    if reply_to:
        params["reply_to"] = reply_to

    resend.api_key = settings.resend_api_key
    try:
        result = resend.Emails.send(params)
    except Exception as e:
        log.exception("resend failed")
        msg = str(e)
        if "only send testing emails" in msg.lower() or "verify a domain" in msg.lower():
            raise EmailError("Resend can only send to your own account email until a domain is "
                             "verified. Set DEMO_RECIPIENT to your Resend login email.") from e
        raise EmailError(f"Email could not be sent: {msg}") from e

    email_id = result.get("id") if isinstance(result, dict) else getattr(result, "id", None)
    log.info("email sent id=%s to=%s (intended %s, safe=%s)", email_id, to, intended_to, safe)
    return {"id": email_id, "to": to, "intended_to": intended_to, "safe_mode": safe}