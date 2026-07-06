"""Auth routes: signup, signin, signout, me."""

from __future__ import annotations

import sqlite3

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field

from . import auth, db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class UserOut(BaseModel):
    id: int
    email: EmailStr


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=auth.COOKIE_NAME,
        value=token,
        max_age=auth.JWT_TTL_SECONDS,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(creds: Credentials, response: Response) -> UserOut:
    """Create a user and issue a session cookie."""
    password_hash = auth.hash_password(creds.password)
    try:
        with db.connect() as conn:
            cur = conn.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                (creds.email.lower(), password_hash),
            )
            user_id = cur.lastrowid
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="email already registered") from exc
    _set_cookie(response, auth.issue_token(user_id, creds.email.lower()))
    return UserOut(id=user_id, email=creds.email.lower())


@router.post("/signin", response_model=UserOut)
def signin(creds: Credentials, response: Response) -> UserOut:
    """Verify credentials and issue a session cookie."""
    with db.connect() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            (creds.email.lower(),),
        ).fetchone()
    if row is None or not auth.verify_password(creds.password, row["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")
    _set_cookie(response, auth.issue_token(row["id"], row["email"]))
    return UserOut(id=row["id"], email=row["email"])


@router.post("/signout")
def signout(response: Response) -> dict:
    response.delete_cookie(auth.COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(request: Request) -> UserOut:
    token = request.cookies.get(auth.COOKIE_NAME)
    payload = auth.decode_token(token) if token else None
    if payload is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="not signed in")
    return UserOut(id=int(payload["sub"]), email=payload["email"])
