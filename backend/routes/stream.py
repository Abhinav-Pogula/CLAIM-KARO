"""Live extraction timeline over Server-Sent Events (SSE).

GET /cases/{id}/extract  streams:
  event: step      data: {"step": "photo", "status": "running|done|error", "output": {...}}
  event: complete  data: {"case_id", "status": "extracted", "case_file", "low_confidence", "errors"}
  event: error     data: {"message": "..."}

The work runs in a background task, so it finishes and saves even if the client disconnects.
"""
import asyncio
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from sse_starlette.sse import EventSourceResponse

from auth import get_current_user
from db import supabase
from pipeline.draft import draft_complaint
from pipeline.extract import extract_all
from pipeline.fuse import fuse, low_confidence_fields
from pipeline.score import score_case, strength_label
from pipeline.verify import verify
from routes.cases import download_evidence, get_case, update_case
from schemas import CaseFile

log = logging.getLogger("stream")
router = APIRouter(prefix="/cases", tags=["stream"])

_tasks: set[asyncio.Task] = set()  # keep task references alive


class _Job:
    """One running pipeline. Many clients can watch it: a late or duplicate client
    (React StrictMode double-mount, page refresh, second tab) gets the full history
    replayed, then live events. Implements .put() so the pipelines treat it like a queue."""

    def __init__(self):
        self.history: list = []
        self.subs: set[asyncio.Queue] = set()
        self.finished = False

    async def put(self, item):
        if item is None:
            self.finished = True
        else:
            self.history.append(item)
        for q in list(self.subs):
            q.put_nowait(item)

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        for item in self.history:
            q.put_nowait(item)
        if self.finished:
            q.put_nowait(None)
        else:
            self.subs.add(q)
        return q


_jobs: dict[str, _Job] = {}   # "extract:<id>" / "run:<id>" -> running job


def _watch(job: _Job) -> EventSourceResponse:
    """Stream a job's events to one client; detach cleanly when the client leaves."""
    q = job.subscribe()

    async def relay():
        try:
            while True:
                item = await q.get()
                if item is None:
                    break
                event, payload = item
                yield _sse(event, payload)
        finally:
            job.subs.discard(q)

    return EventSourceResponse(relay(), ping=15)


def _start(key: str, coro_factory) -> EventSourceResponse:
    """Attach to a running job for this key, or start a new one."""
    job = _jobs.get(key)
    if job is None:
        job = _Job()
        _jobs[key] = job
        task = asyncio.create_task(coro_factory(job))
        _tasks.add(task)
        task.add_done_callback(_tasks.discard)
    return _watch(job)


def _sse(event: str, payload: dict) -> dict:
    return {"event": event, "data": json.dumps(payload, default=str)}


def _log_event(case_id: str, step: str, status: str, output):
    """Best-effort audit log; never breaks the pipeline."""
    try:
        supabase.table("case_events").insert(
            {"case_id": case_id, "step": step, "status": status, "output": output}).execute()
    except Exception as e:
        log.warning("could not log event %s/%s: %s", step, status, e)


def _complete_payload(case_id: str, cf: CaseFile, errors: dict) -> dict:
    return {"case_id": case_id, "status": "extracted", "case_file": cf.model_dump(),
            "low_confidence": low_confidence_fields(cf), "errors": errors}


async def _process(case_id: str, user_id: str, queue: "_Job"):
    """Download -> extract (parallel) -> fuse -> save. Pushes events into the queue."""

    async def emit(step, status, output=None, message=None):
        await queue.put(("step", {"step": step, "status": status, "output": output, "message": message}))
        await run_in_threadpool(_log_event, case_id, step, status, output)

    try:
        await emit("download", "running")
        files = await run_in_threadpool(download_evidence, case_id)
        missing = [k for k in ("photo", "voice", "invoice") if k not in files]
        if missing:
            raise RuntimeError(f"Missing evidence files: {', '.join(missing)}")
        await emit("download", "done")

        result = await extract_all(files["photo"], files["voice"], files["invoice"], on_step=emit)

        if all(result[k] is None for k in ("photo", "voice", "invoice")):
            details = "; ".join(f"{k}: {v}" for k, v in result["errors"].items())
            raise RuntimeError(f"All extractions failed. {details}")

        await emit("fuse", "running")
        cf = fuse(result["photo"], result["voice"], result["invoice"])
        await run_in_threadpool(update_case, case_id, user_id,
                                {"case_file": cf.model_dump(), "status": "extracted"})
        await emit("fuse", "done", {"low_confidence": low_confidence_fields(cf)})

        await queue.put(("complete", _complete_payload(case_id, cf, result["errors"])))
    except HTTPException as e:
        await queue.put(("error", {"message": str(e.detail)}))
    except Exception as e:
        log.exception("extraction failed for case %s", case_id)
        await queue.put(("error", {"message": str(e)}))
    finally:
        _jobs.pop(f"extract:{case_id}", None)
        await queue.put(None)  # end of stream


@router.get("/{case_id}/extract")
async def extract_stream(case_id: str,
                         rerun: bool = Query(False, description="Re-run extraction on an extracted case"),
                         user: dict = Depends(get_current_user)):
    case = await run_in_threadpool(get_case, case_id, user["id"])
    status = case["status"]

    # Already extracted (or later) and no rerun: replay the saved result instantly.
    if status != "uploaded" and not (rerun and status == "extracted"):
        if not case.get("case_file"):
            raise HTTPException(status_code=409, detail=f"Cannot extract a case in status '{status}'")
        cf = CaseFile.model_validate(case["case_file"])

        async def replay():
            yield _sse("complete", {**_complete_payload(case_id, cf, {}), "status": status, "replayed": True})

        return EventSourceResponse(replay())

    # Running already (StrictMode double-mount, refresh, second tab): attach instead of failing.
    return _start(f"extract:{case_id}", lambda job: _process(case_id, user["id"], job))


# ======================= Stage B: verify -> score -> draft =======================

def _load_raw(case_id: str) -> dict:
    """Latest successful extraction output per source, from case_events."""
    try:
        rows = (supabase.table("case_events").select("step,output,created_at")
                .eq("case_id", case_id).eq("status", "done")
                .in_("step", ["photo", "voice", "invoice"])
                .order("created_at", desc=True).execute().data or [])
    except Exception as e:
        log.warning("could not load raw extraction outputs: %s", e)
        return {}
    raw: dict = {}
    for r in rows:
        raw.setdefault(r["step"], r.get("output") or {})
    return raw


def _run_payload(case_id: str, status: str, verify_out: dict, score_out: dict, draft_out: dict) -> dict:
    return {"case_id": case_id, "status": status,
            "verify": verify_out, "score": score_out, "draft": draft_out}


async def _run_process(case_id: str, user_id: str, cf: CaseFile, queue: "_Job", key: str):
    """verify -> score -> draft -> save. Pushes events into the queue."""

    async def emit(step, status, output=None, message=None):
        await queue.put(("step", {"step": step, "status": status, "output": output, "message": message}))
        await run_in_threadpool(_log_event, case_id, step, status, output)

    try:
        await emit("verify", "running")
        raw = await run_in_threadpool(_load_raw, case_id)
        vr = await verify(cf, raw)
        await emit("verify", "done", vr.model_dump())

        await emit("score", "running")
        sr = score_case(cf, vr)
        score_out = {**sr.model_dump(), "label": strength_label(sr.score)}
        await emit("score", "done", score_out)

        await emit("draft", "running")
        d = await draft_complaint(cf, vr, sr)
        await emit("draft", "done", d.model_dump())

        await run_in_threadpool(update_case, case_id, user_id, {
            "verify": {**vr.model_dump(), "score_reasons": sr.reasons},
            "score": sr.score, "route": sr.route,
            "draft": d.model_dump(), "status": "drafted",
        })
        await queue.put(("complete", _run_payload(case_id, "drafted", vr.model_dump(), score_out, d.model_dump())))
    except HTTPException as e:
        await queue.put(("error", {"message": str(e.detail)}))
    except Exception as e:
        log.exception("run failed for case %s", case_id)
        await queue.put(("error", {"message": str(e)}))
    finally:
        _jobs.pop(key, None)
        await queue.put(None)


@router.get("/{case_id}/run")
async def run_stream(case_id: str,
                     rerun: bool = Query(False, description="Re-run verify/score/draft on a drafted case"),
                     user: dict = Depends(get_current_user)):
    case = await run_in_threadpool(get_case, case_id, user["id"])
    status = case["status"]

    # Already drafted/sent and no rerun: replay saved results instantly.
    if status in ("drafted", "sent") and not (rerun and status == "drafted"):
        saved = dict(case.get("verify") or {})
        reasons = saved.pop("score_reasons", [])
        score_out = {"score": case.get("score"), "route": case.get("route"), "reasons": reasons,
                     "label": strength_label(case.get("score") or 0)}
        payload = {**_run_payload(case_id, status, saved, score_out, case.get("draft")), "replayed": True}

        async def replay():
            yield _sse("complete", payload)

        return EventSourceResponse(replay())

    if status not in ("approved", "drafted"):
        raise HTTPException(status_code=409,
                            detail=f"Approve the case before running verification (status: '{status}')")
    if not case.get("case_file"):
        raise HTTPException(status_code=409, detail="Case has no case file")

    key = f"run:{case_id}"
    cf = CaseFile.model_validate(case["case_file"])
    # Running already: attach instead of failing.
    return _start(key, lambda job: _run_process(case_id, user["id"], cf, job, key))
