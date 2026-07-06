"""Password hashing and JWT helpers."""

from __future__ import annotations

import os
import time
from typing import Optional

import bcrypt
import jwt

JWT_ALGORITHM = "HS256"
JWT_TTL_SECONDS = 60 * 60 * 24 * 7  # 7 days
COOKIE_NAME = "prelegal_session"


def jwt_secret() -> str:
    """Return the JWT secret from env (dev fallback for local runs)."""
    return os.environ.get("JWT_SECRET", "dev-secret-change-me")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def issue_token(user_id: int, email: str) -> str:
    now = int(time.time())
    payload = {"sub": str(user_id), "email": email, "iat": now, "exp": now + JWT_TTL_SECONDS}
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Return the decoded payload or ``None`` if invalid/expired."""
    try:
        return jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
