"""Pydantic models: PhotoResult, VoiceResult, InvoiceResult, CaseFile, VerifyResult, Draft."""
"""Pydantic models shared across the ClaimKaro backend.

Two kinds of models live here:
1. LLM output models (PhotoResult, VoiceResult, InvoiceResult, CrossCheckResult, DraftLLM).
   Kept simple (str / int / float / list / Literal) so Gemini and Groq can follow them.
2. App models (CaseFile, VerifyResult, ScoreResult, Draft, StepEvent, request bodies).
"""
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Source = Literal["photo", "voice", "invoice", "user", "system"]
Outcome = Literal["refund", "replacement", "repair", "unknown"]
Route = Literal["return", "replacement", "warranty", "consumer_helpline"]
Severity = Literal["blocking", "warning", "info"]
StepStatus = Literal["running", "done", "error"]


# ---------- shared cleaners ----------

def _clean_confidence(v) -> float:
    """Accept 0.9, 90, '90%', None. Always return 0.0 to 1.0."""
    if v is None:
        return 0.5
    try:
        v = float(str(v).replace("%", "").strip())
    except ValueError:
        return 0.5
    if v > 1:
        v = v / 100
    return max(0.0, min(1.0, v))


def _clean_text(v) -> Optional[str]:
    """Turn '', 'null', 'N/A', 'unknown' into None; strip whitespace."""
    if v is None:
        return None
    v = str(v).strip()
    if v.lower() in {"", "null", "none", "n/a", "na", "unknown", "not visible", "not available"}:
        return None
    return v


# ---------- LLM output models ----------

class PhotoResult(BaseModel):
    product: Optional[str] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    defect_type: Optional[str] = None
    defect_description: Optional[str] = None
    box_2d: Optional[list[int]] = None  # [ymin, xmin, ymax, xmax], 0-1000 scale
    confidence: float = 0.5

    _txt = field_validator("product", "brand", "color", "defect_type",
                           "defect_description", mode="before")(_clean_text)
    _conf = field_validator("confidence", mode="before")(_clean_confidence)

    @field_validator("box_2d", mode="before")
    @classmethod
    def _box(cls, v):
        if not v or not isinstance(v, (list, tuple)) or len(v) != 4:
            return None
        try:
            box = [max(0, min(1000, int(round(float(x))))) for x in v]
        except (TypeError, ValueError):
            return None
        ymin, xmin, ymax, xmax = box
        if ymax <= ymin or xmax <= xmin:
            return None
        return box


class VoiceResult(BaseModel):
    transcript: str = ""
    language: Optional[str] = None
    complaint_summary: Optional[str] = None
    desired_outcome: Outcome = "unknown"
    confidence: float = 0.5

    _txt = field_validator("language", "complaint_summary", mode="before")(_clean_text)
    _conf = field_validator("confidence", mode="before")(_clean_confidence)

    @field_validator("desired_outcome", mode="before")
    @classmethod
    def _outcome(cls, v):
        v = (str(v or "")).strip().lower()
        if "refund" in v or "money" in v or "return" in v:
            return "refund"
        if "replace" in v or "exchange" in v:
            return "replacement"
        if "repair" in v or "fix" in v or "service" in v:
            return "repair"
        return "unknown"


class InvoiceResult(BaseModel):
    order_id: Optional[str] = None
    product: Optional[str] = None
    brand: Optional[str] = None
    variant: Optional[str] = None
    color: Optional[str] = None
    price: Optional[str] = None
    purchase_date: Optional[str] = None  # YYYY-MM-DD, normalised later in Python
    seller: Optional[str] = None
    platform: Optional[str] = None
    confidence: float = 0.5

    _txt = field_validator("order_id", "product", "brand", "variant", "color", "price",
                           "purchase_date", "seller", "platform", mode="before")(_clean_text)
    _conf = field_validator("confidence", mode="before")(_clean_confidence)


class LLMFlag(BaseModel):
    code: str                 # e.g. "color_mismatch"
    severity: Severity = "warning"
    message: str
    fields: list[str] = []    # CaseFile field names involved

    @field_validator("severity", mode="before")
    @classmethod
    def _sev(cls, v):
        v = str(v or "").lower()
        return v if v in {"blocking", "warning", "info"} else "warning"


class CrossCheckResult(BaseModel):
    flags: list[LLMFlag] = []


class DraftLLM(BaseModel):
    subject: str
    body: str


# ---------- app models ----------

class CaseField(BaseModel):
    value: Optional[str] = None
    source: Source = "system"
    confidence: float = 0.5

    _conf = field_validator("confidence", mode="before")(_clean_confidence)


CASEFILE_FIELDS = [
    "product", "brand", "color", "variant", "order_id", "purchase_date", "price",
    "seller", "platform", "defect_type", "defect_description",
    "complaint_summary", "desired_outcome",
]


class CaseFile(BaseModel):
    product: CaseField = Field(default_factory=CaseField)
    brand: CaseField = Field(default_factory=CaseField)
    color: CaseField = Field(default_factory=CaseField)
    variant: CaseField = Field(default_factory=CaseField)
    order_id: CaseField = Field(default_factory=CaseField)
    purchase_date: CaseField = Field(default_factory=CaseField)
    price: CaseField = Field(default_factory=CaseField)
    seller: CaseField = Field(default_factory=CaseField)
    platform: CaseField = Field(default_factory=CaseField)
    defect_type: CaseField = Field(default_factory=CaseField)
    defect_description: CaseField = Field(default_factory=CaseField)
    complaint_summary: CaseField = Field(default_factory=CaseField)
    desired_outcome: CaseField = Field(default_factory=CaseField)
    defect_box: Optional[list[int]] = None
    transcript: str = ""


class Flag(LLMFlag):
    source: Literal["rule", "ai"] = "rule"


class VerifyResult(BaseModel):
    flags: list[Flag] = []
    days_since_purchase: Optional[int] = None
    within_return_window: Optional[bool] = None
    within_warranty: Optional[bool] = None
    policy_brand: Optional[str] = None


class ScoreResult(BaseModel):
    score: int = 0
    route: Route = "consumer_helpline"
    reasons: list[str] = []


class Draft(BaseModel):
    subject: str
    body: str
    to_email: Optional[str] = None
    policy_clause: Optional[str] = None
    policy_source: Optional[str] = None


class StepEvent(BaseModel):
    step: str
    status: StepStatus
    output: Optional[dict] = None
    message: Optional[str] = None


# ---------- request bodies ----------

class CaseFileUpdate(BaseModel):
    """PATCH /cases/{id}/casefile  ->  {"updates": {"color": "Blue", "order_id": "OD123"}}"""
    updates: dict[str, Optional[str]]

    @field_validator("updates")
    @classmethod
    def _only_known(cls, v):
        bad = [k for k in v if k not in CASEFILE_FIELDS]
        if bad:
            raise ValueError(f"Unknown fields: {bad}. Allowed: {CASEFILE_FIELDS}")
        return v