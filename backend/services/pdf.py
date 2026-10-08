"""Service: generate a formatted PDF complaint report using ReportLab."""
"""Complaint template as a one-page PDF (ReportLab).

build_complaint_pdf(case_file, draft, score, route) -> bytes
Built-in Helvetica only supports Latin text, so everything is sanitised first.
"""
import html
from datetime import date
from io import BytesIO
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

from schemas import CaseFile, Draft

INDIGO = colors.HexColor("#4F46E5")
INDIGO_TINT = colors.HexColor("#EEF2FF")
AMBER_TINT = colors.HexColor("#FEF3C7")
AMBER = colors.HexColor("#D97706")
TEXT = colors.HexColor("#0F172A")
MUTED = colors.HexColor("#64748B")
BORDER = colors.HexColor("#E2E8F0")

ROUTE_LABEL = {"return": "Return and refund", "replacement": "Replacement",
               "warranty": "Warranty claim", "consumer_helpline": "Consumer helpline complaint"}
BLANK = "______________________________"

_REPLACE = {"\u20b9": "Rs. ", "\u2013": "-", "\u2014": "-", "\u2018": "'", "\u2019": "'",
            "\u201c": '"', "\u201d": '"', "\u2026": "...", "\u00a0": " ", "\u2022": "-"}


def _clean(text: Optional[str]) -> str:
    """Make text safe for Helvetica + ReportLab Paragraph markup."""
    if not text:
        return ""
    t = str(text)
    for k, v in _REPLACE.items():
        t = t.replace(k, v)
    t = t.encode("cp1252", "ignore").decode("cp1252")   # drop characters the font can't draw
    return html.escape(t, quote=False)


def _p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text.replace("\n", "<br/>"), style)


def _styles() -> dict:
    base = dict(fontName="Helvetica", fontSize=10, leading=14, textColor=TEXT, alignment=TA_LEFT)
    return {
        "brand": ParagraphStyle("brand", **{**base, "fontName": "Helvetica-Bold", "fontSize": 18,
                                            "leading": 22, "textColor": colors.white}),
        "brand_sub": ParagraphStyle("brand_sub", **{**base, "fontSize": 9, "textColor": colors.white}),
        "h": ParagraphStyle("h", **{**base, "fontName": "Helvetica-Bold", "fontSize": 11,
                                    "leading": 15, "spaceBefore": 10, "spaceAfter": 4}),
        "body": ParagraphStyle("body", **base),
        "small": ParagraphStyle("small", **{**base, "fontSize": 8.5, "leading": 12, "textColor": MUTED}),
        "label": ParagraphStyle("label", **{**base, "fontSize": 9, "textColor": MUTED}),
        "value": ParagraphStyle("value", **{**base, "fontName": "Helvetica-Bold"}),
    }


def _box(content: list, bg, border, width) -> Table:
    t = Table([[content]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.8, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def build_complaint_pdf(cf: CaseFile, draft: Draft, score: Optional[int] = None,
                        route: Optional[str] = None) -> bytes:
    s = _styles()
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=14 * mm, bottomMargin=14 * mm,
                            title=_clean(draft.subject) or "Consumer complaint", author="ClaimKaro")
    width = doc.width
    story = []

    # header band
    header = Table([[_p("ClaimKaro", s["brand"]),
                     _p(f"Consumer complaint<br/>Prepared {date.today().strftime('%d %b %Y')}",
                        s["brand_sub"])]], colWidths=[width * 0.55, width * 0.45])
    header.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INDIGO), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story += [header, Spacer(1, 8)]

    # fill-in box
    fill = [_p("<b>Fill in before sending</b>", s["body"]), Spacer(1, 4)]
    for label in ("Your name", "Phone", "Email", "Address"):
        fill.append(_p(f"{label}: {BLANK}", s["body"]))
    story += [_box(fill, AMBER_TINT, AMBER, width), Spacer(1, 6)]

    # case facts
    story.append(_p("Case details", s["h"]))
    price = f"Rs. {cf.price.value}" if cf.price.value else None
    color_variant = " / ".join(v for v in (cf.color.value, cf.variant.value) if v) or None
    rows = []
    rows.append(("Order ID", cf.order_id.value))
    rows.append(("Product", cf.product.value))
    rows.append(("Brand", cf.brand.value))
    rows.append(("Color / variant", color_variant))
    rows.append(("Purchase date", cf.purchase_date.value))
    rows.append(("Amount paid", price))
    rows.append(("Seller", cf.seller.value))
    rows.append(("Platform", cf.platform.value))
    rows.append(("Defect", cf.defect_description.value or cf.defect_type.value))
    if route:
        rows.append(("Recommended route", ROUTE_LABEL.get(route, route)))
    if score is not None:
        rows.append(("Claim score", f"{score}/100"))

    table_data = [[_p(k, s["label"]), _p(_clean(v), s["value"])] for k, v in rows if v]
    t = Table(table_data, colWidths=[width * 0.35, width * 0.65])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story += [t, Spacer(1, 8)]

    # formal complaint letter
    story.append(_p("Formal complaint", s["h"]))
    complaint_box = [
        _p(f"<b>Subject:</b> {_clean(draft.subject)}", s["body"]),
        Spacer(1, 4),
        _p(_clean(draft.body), s["body"]),
    ]
    if draft.policy_clause:
        complaint_box += [
            Spacer(1, 6),
            _p(f"<b>Policy reference:</b> {_clean(draft.policy_clause)}", s["small"]),
        ]
    story.append(_box(complaint_box, INDIGO_TINT, INDIGO, width))

    doc.build(story)
    return buf.getvalue()