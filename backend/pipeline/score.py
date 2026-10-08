"""Pipeline: score CaseFile 0–100 and determine escalation route (email / portal / legal)."""
"""Score step: claim strength 0-100 + recommended route. Pure Python, deterministic.

score = evidence (40) + eligibility (40) + consistency (20)
route = return | replacement  (inside return window)
        warranty              (outside return window, inside warranty)
        consumer_helpline     (outside both, or dates unknown)
"""
from schemas import CaseFile, ScoreResult, VerifyResult

PENALTY = {("warning", "rule"): 8, ("warning", "ai"): 6, ("info", "rule"): 2, ("info", "ai"): 2}
DATE_CODES = {"return_window_expired", "warranty_expired"}  # handled by eligibility, not penalised twice


def strength_label(score: int) -> str:
    return "Strong" if score >= 70 else "Fair" if score >= 40 else "Weak"


def score_case(cf: CaseFile, vr: VerifyResult) -> ScoreResult:
    reasons: list[tuple[int, str]] = []   # (impact, text): sorted by impact at the end

    # ---- evidence (40) ----
    evidence = 0
    if cf.defect_type.value and cf.defect_type.source == "photo":
        pts = round(20 * cf.defect_type.confidence)
        evidence += pts
        if pts >= 15:
            reasons.append((pts, "The photo clearly shows the defect."))
        else:
            reasons.append((-(20 - pts), "The defect is hard to see in the photo."))
    else:
        reasons.append((-20, "No visible defect in the photo."))

    invoice_fields = ["order_id", "purchase_date", "price", "seller"]
    present = sum(1 for f in invoice_fields if getattr(cf, f).value)
    inv_pts = round(15 * present / len(invoice_fields))
    evidence += inv_pts
    if present == len(invoice_fields):
        reasons.append((inv_pts, "The invoice has the order ID, date, price and seller."))
    else:
        missing = [f.replace("_", " ") for f in invoice_fields if not getattr(cf, f).value]
        reasons.append((-(15 - inv_pts), f"The invoice is missing: {', '.join(missing)}."))

    if cf.complaint_summary.value and cf.complaint_summary.confidence >= 0.5:
        evidence += 5

    # ---- eligibility (40) ----
    if vr.within_return_window:
        eligibility = 40
        reasons.append((40, "You're still inside the return window."))
    elif vr.within_warranty:
        eligibility = 30
        reasons.append((30, "The return window has passed, but you're covered by warranty."))
    elif vr.days_since_purchase is not None:
        eligibility = 10
        reasons.append((-30, "Both the return window and the warranty have ended."))
    else:
        eligibility = 0
        reasons.append((-40, "Purchase date is unknown, so eligibility can't be confirmed."))

    # ---- consistency (20) ----
    consistency = 20
    for f in vr.flags:
        if f.code in DATE_CODES:
            continue
        if f.severity == "blocking":
            consistency -= 20
        else:
            consistency -= PENALTY.get((f.severity, f.source), 4)
        if f.severity in ("blocking", "warning"):
            reasons.append((-8, f.message))
    consistency = max(0, consistency)
    if consistency == 20:
        reasons.append((20, "All your evidence is consistent."))

    total = max(0, min(100, evidence + eligibility + consistency))

    # ---- route ----
    if vr.within_return_window:
        route = "replacement" if cf.desired_outcome.value == "replacement" else "return"
    elif vr.within_warranty:
        route = "warranty"
    else:
        route = "consumer_helpline"

    # strongest positives first, then the biggest problems; max 5 lines
    positives = [t for i, t in sorted(reasons, key=lambda r: -r[0]) if i > 0]
    negatives = [t for i, t in sorted(reasons, key=lambda r: r[0]) if i <= 0]
    ordered = (positives[:3] + negatives[:2]) if total >= 70 else (negatives[:3] + positives[:2])
    return ScoreResult(score=total, route=route, reasons=ordered[:5])