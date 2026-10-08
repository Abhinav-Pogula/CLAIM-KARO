"""Pipeline: extract structured data from photo (Gemini vision), voice (Groq Whisper) and invoice (Gemini)."""
"""Extraction step: photo, voice note and invoice -> structured results.

Each extractor is independent. extract_all() runs all three in parallel and never
crashes because one of them failed: it returns partial results plus errors.
"""
import asyncio
import logging
import mimetypes
import re
from datetime import datetime
from typing import Awaitable, Callable, Optional

from router import AIError, reason, transcribe, vision
from schemas import InvoiceResult, PhotoResult, VoiceResult

log = logging.getLogger("extract")

# ---------- file type handling ----------

IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
DOC_MIMES = IMAGE_MIMES | {"application/pdf"}
AUDIO_MIMES = {"audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave",
               "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac", "audio/ogg",
               "audio/webm", "audio/flac", "video/webm"}  # browsers record voice as video/webm

_EXT_FIX = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
            ".webp": "image/webp", ".heic": "image/heic", ".pdf": "application/pdf",
            ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4",
            ".aac": "audio/aac", ".ogg": "audio/ogg", ".webm": "audio/webm",
            ".flac": "audio/flac"}


class ExtractError(Exception):
    """Bad input file (wrong type, empty)."""


def normalize_mime(filename: Optional[str], mime: Optional[str]) -> str:
    """Trust the file extension over the browser's guess; fall back to mimetypes."""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if filename and "." in filename else ""
    if ext in _EXT_FIX:
        return _EXT_FIX[ext]
    mime = (mime or "").split(";")[0].strip().lower()
    if mime and mime != "application/octet-stream":
        return mime
    return mimetypes.guess_type(filename or "")[0] or "application/octet-stream"


def _check(data: bytes, mime: str, allowed: set, label: str):
    if not data:
        raise ExtractError(f"{label} file is empty")
    if mime not in allowed:
        raise ExtractError(f"{label} type '{mime}' not supported")


# ---------- value cleaners (reused by verify later) ----------

_DATE_FORMATS = ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y", "%Y/%m/%d",
                 "%d %b %Y", "%d %B %Y", "%d-%b-%Y", "%d-%B-%Y",
                 "%b %d %Y", "%B %d %Y", "%d/%m/%y", "%d-%m-%y"]


def normalize_date(value: Optional[str]) -> Optional[str]:
    """Any common Indian/ISO date string -> 'YYYY-MM-DD'. Day-first. None if unparseable."""
    if not value:
        return None
    v = re.sub(r"(\d+)(st|nd|rd|th)\b", r"\1", str(value), flags=re.IGNORECASE)
    v = v.replace(",", " ").strip()
    v = re.sub(r"\s+", " ", v)
    v = v.split("T")[0] if re.match(r"\d{4}-\d{2}-\d{2}T", v) else v
    for fmt in _DATE_FORMATS:
        try:
            d = datetime.strptime(v, fmt)
            if d.year < 2000 or d > datetime.now():
                continue  # reject obviously wrong / future dates
            return d.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def normalize_price(value: Optional[str]) -> Optional[str]:
    """'₹1,299.00' / 'Rs. 1299' / 'INR 1,299' -> '1299'."""
    if not value:
        return None
    m = re.search(r"\d[\d,]*(?:\.\d+)?", str(value))
    if not m:
        return None
    num = float(m.group().replace(",", ""))
    return str(int(num)) if num.is_integer() else f"{num:.2f}"


# ---------- prompts ----------

PHOTO_PROMPT = """You are inspecting a customer's photo of a product they say is defective.
Identify:
- product: what the item is (e.g. "wireless earbuds", "smartphone")
- brand: only if a logo or name is clearly visible, else null
- color: main color of the product
- defect_type: short label (e.g. "cracked screen", "broken hinge", "missing part", "no visible defect")
- defect_description: one sentence describing exactly what is visibly wrong
- box_2d: bounding box around the defect as [ymin, xmin, ymax, xmax] normalized to 0-1000.
  If no defect is visible, use null.
- confidence: 0 to 1, how sure you are a real defect is visible
Do not guess details you cannot see."""

INVOICE_PROMPT = """You are reading a purchase invoice or order screenshot from an Indian e-commerce
site or store. Extract:
- order_id: the order / invoice number exactly as printed
- product, brand, variant (e.g. "128GB", "Size M"), color
- price: the final amount paid for this product
- purchase_date: the ORDER or INVOICE date (not delivery date), formatted YYYY-MM-DD.
  Indian dates are day-first: 05/03/2026 means 5 March 2026.
- seller: seller name
- platform: Amazon, Flipkart, Myntra, Croma, etc. if identifiable, else null
- confidence: 0 to 1, how readable and complete the invoice is
Use null for anything not present. Never invent an order ID."""

VOICE_SYSTEM = """You structure a customer's spoken complaint about a defective product.
The transcript may be Hindi, English or Hinglish.
- language: the main language spoken
- complaint_summary: one clear sentence in ENGLISH describing the problem
- desired_outcome: one of refund, replacement, repair, unknown
- confidence: 0 to 1, how clearly the complaint was expressed
Keep "transcript" exactly as given."""


# ---------- extractors ----------

async def extract_photo(data: bytes, mime: str) -> PhotoResult:
    _check(data, mime, IMAGE_MIMES, "Photo")
    return await vision([(data, mime)], PHOTO_PROMPT, PhotoResult)


async def extract_invoice(data: bytes, mime: str) -> InvoiceResult:
    _check(data, mime, DOC_MIMES, "Invoice")
    result = await vision([(data, mime)], INVOICE_PROMPT, InvoiceResult)
    result.purchase_date = normalize_date(result.purchase_date)
    result.price = normalize_price(result.price)
    return result


async def extract_voice(data: bytes, filename: str, mime: str) -> VoiceResult:
    _check(data, mime, AUDIO_MIMES, "Voice note")
    transcript = await transcribe(data, filename, mime)
    result = await reason(VOICE_SYSTEM, f"Transcript:\n{transcript}", VoiceResult)
    result.transcript = transcript  # always keep the real transcript, never the model's copy
    return result


# ---------- run all three ----------

StepCallback = Callable[[str, str, Optional[dict]], Awaitable[None]]


async def _run_step(name: str, coro, on_step: Optional[StepCallback]):
    """Emit running -> done/error for one step. Returns (result, error_message)."""
    if on_step:
        await on_step(name, "running", None)
    try:
        result = await coro
        if on_step:
            await on_step(name, "done", result.model_dump())
        return result, None
    except (ExtractError, AIError) as e:
        msg = str(e)
    except Exception as e:  # never let one step crash the whole case
        log.exception("unexpected error in %s", name)
        msg = f"{type(e).__name__}: {e}"
    if on_step:
        await on_step(name, "error", {"error": msg})
    return None, msg


async def extract_all(
    photo: tuple[bytes, str, str],    # (bytes, filename, mime)
    voice: tuple[bytes, str, str],
    invoice: tuple[bytes, str, str],
    on_step: Optional[StepCallback] = None,
) -> dict:
    """Run all three extractions in parallel.
    Returns {"photo": PhotoResult|None, "voice": VoiceResult|None,
             "invoice": InvoiceResult|None, "errors": {step: message}}"""
    p_data, p_name, p_mime = photo
    v_data, v_name, v_mime = voice
    i_data, i_name, i_mime = invoice

    results = await asyncio.gather(
        _run_step("photo", extract_photo(p_data, normalize_mime(p_name, p_mime)), on_step),
        _run_step("voice", extract_voice(v_data, v_name, normalize_mime(v_name, v_mime)), on_step),
        _run_step("invoice", extract_invoice(i_data, normalize_mime(i_name, i_mime)), on_step),
    )
    out = {"errors": {}}
    for name, (result, err) in zip(("photo", "voice", "invoice"), results):
        out[name] = result
        if err:
            out["errors"][name] = err
    return out