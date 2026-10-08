from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db import supabase

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency that validates a Supabase JWT.
    Extracts the Bearer token from the Authorization header,
    verifies it with supabase.auth.get_user(), and returns
    a dict with {id, email}. Raises HTTP 401 on any failure.
    """
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if user is None:
            raise ValueError("No user returned")
        return {"id": str(user.id), "email": user.email}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
