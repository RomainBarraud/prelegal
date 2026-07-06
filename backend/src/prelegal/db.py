"""SQLite database access.

The database file is recreated from scratch on every application start so each
container run begins with an empty ``users`` table.
"""

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


def _db_path() -> Path:
    """Resolve the SQLite file path from ``PRELEGAL_DB_PATH`` or default."""
    return Path(os.environ.get("PRELEGAL_DB_PATH", "/app/data/app.db"))


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def init_db() -> None:
    """Delete any existing DB file and create a fresh schema."""
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        path.unlink()
    with sqlite3.connect(path) as conn:
        conn.executescript(SCHEMA)
        conn.commit()


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    """Yield a connection with row access by column name."""
    conn = sqlite3.connect(_db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
