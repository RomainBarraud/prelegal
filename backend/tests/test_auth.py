"""End-to-end auth flow tests."""

from prelegal.auth import COOKIE_NAME


def test_signup_signin_me_signout(client):
    r = client.post("/api/auth/signup", json={"email": "a@example.com", "password": "hunter2hunter2"})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["email"] == "a@example.com"
    assert body["id"] >= 1
    assert COOKIE_NAME in client.cookies

    # /me works with the cookie set by signup
    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "a@example.com"

    # signout clears the cookie, /me is then 401
    out = client.post("/api/auth/signout")
    assert out.status_code == 200
    client.cookies.clear()
    me2 = client.get("/api/auth/me")
    assert me2.status_code == 401

    # signin issues a fresh cookie
    r2 = client.post("/api/auth/signin", json={"email": "a@example.com", "password": "hunter2hunter2"})
    assert r2.status_code == 200
    assert COOKIE_NAME in client.cookies


def test_signup_duplicate_email_conflicts(client):
    payload = {"email": "b@example.com", "password": "hunter2hunter2"}
    assert client.post("/api/auth/signup", json=payload).status_code == 201
    client.cookies.clear()
    r = client.post("/api/auth/signup", json=payload)
    assert r.status_code == 409


def test_signin_wrong_password_401(client):
    client.post("/api/auth/signup", json={"email": "c@example.com", "password": "hunter2hunter2"})
    client.cookies.clear()
    r = client.post("/api/auth/signin", json={"email": "c@example.com", "password": "wrongwrong123"})
    assert r.status_code == 401


def test_me_without_cookie_401(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401
