from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from auth import get_current_user

app = FastAPI(title="ClaimKaro API", version="0.1.0")

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers  (uncomment as each module is implemented)
# ---------------------------------------------------------------------------
# from routes.cases   import router as cases_router;   app.include_router(cases_router,   prefix="/cases",   tags=["cases"])
# from routes.stream  import router as stream_router;  app.include_router(stream_router,  prefix="/stream",  tags=["stream"])
# from routes.actions import router as actions_router; app.include_router(actions_router, prefix="/actions", tags=["actions"])


# ---------------------------------------------------------------------------
# Core routes
# ---------------------------------------------------------------------------
@app.get("/health", tags=["meta"])
async def health():
    """Liveness probe — returns ok."""
    return {"status": "ok"}


@app.get("/me", tags=["auth"])
async def me(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's id and email."""
    return current_user
