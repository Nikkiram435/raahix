# Sab tests ke liye common setup: alag database, alag key, saaf shuruaat.

import os
import tempfile
from pathlib import Path

# Test ke liye alag database aur key. Yeh imports se PEHLE hona zaroori hai,
# taaki asli raahix.db aur .env ko tests kabhi na chhuyein.
_tmp = Path(tempfile.mkdtemp(prefix="raahix_test_"))
os.environ["DATABASE_URL"] = "sqlite:///" + (_tmp / "test.db").as_posix()
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-only-1234567890"
os.environ["GEMINI_API_KEY"] = ""   # tests kabhi asli AI ko call na karein
os.environ["GEOAPIFY_API_KEY"] = ""

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from database import Base, engine  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture()
def client():
    """Har test ko bilkul khaali database milta hai."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


def make_user(client, email, name, password="password123"):
    """Naya user banata hai, aur uske Authorization headers lautata hai."""
    res = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    assert res.status_code == 201, res.text
    return {"Authorization": "Bearer " + res.json()["access_token"]}


@pytest.fixture()
def alice(client):
    return make_user(client, "alice@example.com", "Alice")


@pytest.fixture()
def bob(client):
    return make_user(client, "bob@example.com", "Bob")

