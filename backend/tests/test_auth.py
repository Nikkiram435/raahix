# Register, login aur /me ke tests.

from database import SessionLocal
from models import User

NEW_USER = {"name": "Nikki", "email": "nikki@example.com", "password": "password123"}


def test_register_returns_token_and_no_password(client):
    res = client.post("/api/auth/register", json=NEW_USER)
    assert res.status_code == 201
    body = res.json()
    assert body["access_token"]
    assert body["user"]["email"] == "nikki@example.com"
    assert "password" not in res.text


def test_password_is_stored_hashed(client):
    client.post("/api/auth/register", json=NEW_USER)
    with SessionLocal() as db:
        user = db.query(User).filter_by(email="nikki@example.com").one()
    assert user.password_hash != NEW_USER["password"]
    assert user.password_hash.startswith("$2")   # bcrypt ki pehchaan


def test_duplicate_email_is_rejected_even_with_different_case(client):
    assert client.post("/api/auth/register", json=NEW_USER).status_code == 201
    again = {**NEW_USER, "email": "NIKKI@example.com"}
    assert client.post("/api/auth/register", json=again).status_code == 409


def test_register_rejects_bad_input(client):
    assert client.post("/api/auth/register", json={**NEW_USER, "password": "abc"}).status_code == 422
    assert client.post("/api/auth/register", json={**NEW_USER, "name": ""}).status_code == 422
    assert client.post("/api/auth/register", json={**NEW_USER, "email": "not-an-email"}).status_code == 422


def test_login_works(client):
    client.post("/api/auth/register", json=NEW_USER)
    res = client.post("/api/auth/login", json={"email": "nikki@example.com", "password": "password123"})
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_login_email_is_case_insensitive(client):
    client.post("/api/auth/register", json=NEW_USER)
    res = client.post("/api/auth/login", json={"email": "NIKKI@example.com", "password": "password123"})
    assert res.status_code == 200


def test_wrong_password_and_unknown_email_look_the_same(client):
    client.post("/api/auth/register", json=NEW_USER)
    wrong_pw = client.post("/api/auth/login", json={"email": "nikki@example.com", "password": "wrong-password"})
    unknown = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "password123"})
    assert wrong_pw.status_code == 401
    assert unknown.status_code == 401
    # Dono ka jawab ek jaisa, taaki koi andaza na laga sake ki kaunsa email registered hai
    assert wrong_pw.json() == unknown.json()


def test_me_with_token(client, alice):
    res = client.get("/api/auth/me", headers=alice)
    assert res.status_code == 200
    assert res.json()["email"] == "alice@example.com"


def test_me_without_or_with_bad_token(client):
    assert client.get("/api/auth/me").status_code == 401
    bad = {"Authorization": "Bearer this-is-not-a-real-token"}
    assert client.get("/api/auth/me", headers=bad).status_code == 401