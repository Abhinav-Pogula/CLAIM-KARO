"""Auth: verifies the Supabase access token sent as 'Authorization: Bearer <token>'.

DEV_AUTH=true (local testing only): requests WITHOUT a token act as DEV_USER_ID.
Requests WITH a token are always verified for real. Set DEV_AUTH=false before deploying.
"""
import logging

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import settings
from db import supabase

log = logging.getLogger("auth")
bearer = HTTPBearer(auto_error=False)

if settings.dev_auth:
    log.warning("DEV_AUTH is ON: requests without a token act as the dev user. Never deploy like this.")


def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if creds is None or not creds.credentials:
        if settings.dev_auth and settings.dev_user_id:
            return {"id": settings.dev_user_id, "email": "dev@claimkaro.test"}
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        res = supabase.auth.get_user(creds.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if not res or not res.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"id": res.user.id, "email": res.user.email}