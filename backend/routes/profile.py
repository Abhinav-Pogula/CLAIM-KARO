"""Profile: the user's demo merchant inbox (where complaint emails are delivered in demo mode).

GET /me      -> {id, email, demo_email}
PUT /me/demo-inbox  {"email": "..."} -> {demo_email}
"""
import logging
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from auth import get_current_user
from db import supabase

log = logging.getLogger("profile")
router = APIRouter(tags=["profile"])
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class DemoInbox(BaseModel):
    email: str


def get_demo_email(user_id: str) -> Optional[str]:
    try:
        rows = supabase.table("profiles").select("demo_email").eq("id", user_id).limit(1).execute().data
    except Exception as e:
        log.warning("could not read profile: %s", e)
        return None
    return (rows[0].get("demo_email") if rows else None) or None


def _set_demo_email(user_id: str, email: str):
    supabase.table("profiles").upsert({"id": user_id, "demo_email": email}).execute()


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    demo = await run_in_threadpool(get_demo_email, user["id"])
    return {**user, "demo_email": demo}


@router.put("/me/demo-inbox")
async def set_demo_inbox(body: DemoInbox, user: dict = Depends(get_current_user)):
    email = body.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Please enter a valid email address.")
    try:
        await run_in_threadpool(_set_demo_email, user["id"], email)
    except Exception as e:
        log.exception("could not save demo inbox")
        raise HTTPException(status_code=500, detail=f"Could not save demo inbox: {e}")
    return {"demo_email": email}
