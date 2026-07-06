"""FastAPI entrypoint: mounts /api routes and the static frontend."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from . import db
from .routes_auth import router as auth_router


def _static_dir() -> Path:
    return Path(os.environ.get("PRELEGAL_STATIC_DIR", "/app/static"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Load env and rebuild the SQLite DB from scratch on every startup."""
    load_dotenv()
    db.init_db()
    yield


app = FastAPI(title="Prelegal", version="0.1.0", lifespan=lifespan)
app.include_router(auth_router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


static_dir = _static_dir()
if static_dir.exists():
    # ``html=True`` makes StaticFiles serve index.html on unknown paths so that
    # a Next.js static export works as a single-page site.
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
