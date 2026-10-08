"""Routes: upload evidence, list cases, get case detail, patch CaseFile, approve case."""
"""Case routes: upload, list, detail, edit CaseFile, approve.

Storage layout: evidence/<user_id>/<case_id>/<kind><ext>
Status flow:    uploaded -> extracted -> approved -> drafted -> sent
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from auth import get_current_user
from db import supabase
from pipeline.extract import AUDIO_MIMES, DOC_MIMES, IMAGE_MIMES, normalize_mime
from pipeline.fuse import apply_updates, low_confidence_fields
from schemas import CaseFile, CaseFileUpdate

log = logging.getLogger("cases")
router = APIRouter(prefix="/cases", tags=["cases"])

BUCKET = "evidence"
MAX_BYTES = 10 * 1024 * 1024  # 10 MB per file
ALLOWED = {"photo": IMAGE_MIMES, "voice": AUDIO_MIMES, "invoice": DOC_MIMES}
_EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/heic": ".heic",
        "image/heif": ".heif", "application/pdf": ".pdf", "audio/mpeg": ".mp3", "audio/mp3": ".mp3",
        "audio/wav": ".wav", "audio/x-wav": ".wav", "audio/wave": ".wav", "audio/mp4": ".m4a",
        "audio/x-m4a": ".m4a", "audio/m4a": ".m4a", "audio/aac": ".aac", "audio/ogg": ".ogg",
        "audio/webm": ".webm", "video/webm": ".webm", "audio/flac": ".flac"}


# ---------- helpers (also used by stream.py) ----------

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _db_error(e: Exception, action: str):
    log.exception("DB error while %s", action)
    raise HTTPException(status_code=500, detail=f"Database error while {action}: {e}")


def get_case(case_id: str, user_id: str) -> dict:
    """Fetch a case owned by user_id or raise 404."""
    try:
        uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Case not found")
    try:
        res = (supabase.table("cases").select("*")
               .eq("id", case_id).eq("user_id", user_id).limit(1).execute())
    except Exception as e:
        _db_error(e, "loading case")
    if not res.data:
        raise HTTPException(status_code=404, detail="Case not found")
    return res.data[0]


def update_case(case_id: str, user_id: str, fields: dict) -> dict:
    fields = {**fields, "updated_at": _now()}
    try:
        res = (supabase.table("cases").update(fields)
               .eq("id", case_id).eq("user_id", user_id).execute())
    except Exception as e:
        _db_error(e, "updating case")
    return res.data[0] if res.data else {}


def get_evidence(case_id: str) -> list[dict]:
    try:
        return supabase.table("evidence").select("*").eq("case_id", case_id).execute().data or []
    except Exception as e:
        _db_error(e, "loading evidence")


def download_evidence(case_id: str) -> dict[str, tuple[bytes, str, str]]:
    """{kind: (bytes, filename, mime)} for photo / voice / invoice. Used by the extract stream."""
    out = {}
    for ev in get_evidence(case_id):
        try:
            data = supabase.storage.from_(BUCKET).download(ev["storage_path"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not download {ev['kind']}: {e}")
        out[ev["kind"]] = (data, ev["storage_path"].rsplit("/", 1)[-1], ev["mime_type"])
    return out


def _signed_url(path: str) -> Optional[str]:
    try:
        r = supabase.storage.from_(BUCKET).create_signed_url(path, 3600)
        return r.get("signedURL") or r.get("signedUrl") or r.get("signed_url")
    except Exception:
        log.warning("could not sign %s", path)
        return None


def _read_upload(kind: str, file: UploadFile) -> tuple[bytes, str]:
    """Read and validate one uploaded file. Returns (bytes, mime)."""
    if file is None or not file.filename:
        raise HTTPException(status_code=400, detail=f"Missing {kind} file")
    data = file.file.read(MAX_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail=f"{kind} file is empty")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"{kind} file is larger than 10 MB")
    mime = normalize_mime(file.filename, file.content_type)
    if mime not in ALLOWED[kind]:
        raise HTTPException(status_code=415, detail=f"{kind}: type '{mime}' not allowed")
    return data, mime


def _cleanup(case_id: str, paths: list[str]):
    """Best-effort rollback of a half-created case."""
    try:
        if paths:
            supabase.storage.from_(BUCKET).remove(paths)
        supabase.table("cases").delete().eq("id", case_id).execute()
    except Exception:
        log.exception("cleanup failed for case %s", case_id)


# ---------- routes ----------

@router.post("")
def create_case(
    photo: UploadFile = File(...),
    voice: UploadFile = File(...),
    invoice: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload the 3 evidence files. Returns case_id. Extraction runs via GET /cases/{id}/extract."""
    files = {"photo": _read_upload("photo", photo),
             "voice": _read_upload("voice", voice),
             "invoice": _read_upload("invoice", invoice)}

    try:
        res = supabase.table("cases").insert({"user_id": user["id"], "status": "uploaded"}).execute()
        case_id = res.data[0]["id"]
    except Exception as e:
        _db_error(e, "creating case")

    uploaded = []
    try:
        for kind, (data, mime) in files.items():
            path = f"{user['id']}/{case_id}/{kind}{_EXT.get(mime, '')}"
            supabase.storage.from_(BUCKET).upload(path, data, {"content-type": mime, "upsert": "true"})
            uploaded.append(path)
            supabase.table("evidence").insert(
                {"case_id": case_id, "kind": kind, "storage_path": path, "mime_type": mime}).execute()
    except Exception as e:
        _cleanup(case_id, uploaded)
        log.exception("upload failed")
        raise HTTPException(status_code=500, detail=f"Upload failed, nothing was saved: {e}")

    return {"case_id": case_id, "status": "uploaded"}


@router.get("")
def list_cases(user: dict = Depends(get_current_user)):
    try:
        res = (supabase.table("cases")
               .select("id,status,score,route,case_file,created_at,updated_at")
               .eq("user_id", user["id"]).order("created_at", desc=True).execute())
    except Exception as e:
        _db_error(e, "listing cases")
    items = []
    for c in res.data or []:
        cf = c.get("case_file") or {}
        items.append({
            "id": c["id"], "status": c["status"], "score": c.get("score"), "route": c.get("route"),
            "product": (cf.get("product") or {}).get("value"),
            "brand": (cf.get("brand") or {}).get("value"),
            "created_at": c["created_at"], "updated_at": c.get("updated_at"),
        })
    return items


@router.get("/{case_id}")
def case_detail(case_id: str, user: dict = Depends(get_current_user)):
    case = get_case(case_id, user["id"])
    evidence = [{"kind": e["kind"], "mime_type": e["mime_type"], "url": _signed_url(e["storage_path"])}
                for e in get_evidence(case_id)]
    cf = CaseFile.model_validate(case["case_file"]) if case.get("case_file") else None
    return {**case, "evidence": evidence,
            "low_confidence": low_confidence_fields(cf) if cf else []}


@router.patch("/{case_id}/casefile")
def edit_casefile(case_id: str, body: CaseFileUpdate, user: dict = Depends(get_current_user)):
    case = get_case(case_id, user["id"])
    if case["status"] != "extracted":
        raise HTTPException(status_code=409,
                            detail=f"Can only edit after extraction and before approval (status: {case['status']})")
    cf = apply_updates(CaseFile.model_validate(case["case_file"]), body.updates)
    update_case(case_id, user["id"], {"case_file": cf.model_dump()})
    return {"case_file": cf.model_dump(), "low_confidence": low_confidence_fields(cf)}


@router.post("/{case_id}/approve")
def approve_case(case_id: str, user: dict = Depends(get_current_user)):
    case = get_case(case_id, user["id"])
    if case["status"] != "extracted" or not case.get("case_file"):
        raise HTTPException(status_code=409,
                            detail=f"Case must be extracted before approval (status: {case['status']})")
    cf = CaseFile.model_validate(case["case_file"])
    missing = [n for n in ("product", "purchase_date") if not getattr(cf, n).value]
    if missing:
        raise HTTPException(status_code=422,
                            detail=f"Fill these fields before approving: {', '.join(missing)}")
    update_case(case_id, user["id"], {"status": "approved"})
    return {"case_id": case_id, "status": "approved"}