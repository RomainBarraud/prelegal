"""Test fixtures: isolated SQLite per test, TestClient with app lifespan."""

from __future__ import annotations

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("PRELEGAL_DB_PATH", str(tmp_path / "test.db"))
    monkeypatch.setenv("PRELEGAL_STATIC_DIR", str(tmp_path / "nonexistent"))
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    # Import inside the fixture so env vars are honoured on module load.
    from prelegal.main import app

    with TestClient(app) as c:
        yield c
