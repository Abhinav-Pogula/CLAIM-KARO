from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from auth import get_current_user
from routes.cases import router as cases_router
from routes.stream import router as stream_router
from routes.actions import router as actions_router
from routes.profile import router as profile_router

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
# Routers
# ---------------------------------------------------------------------------
app.include_router(cases_router)
app.include_router(stream_router)
app.include_router(actions_router)
app.include_router(profile_router)


# ---------------------------------------------------------------------------
# Core routes
# ---------------------------------------------------------------------------
@app.get("/health", tags=["meta"])
async def health():
    """Liveness probe — returns ok."""
    return {"status": "ok"}


