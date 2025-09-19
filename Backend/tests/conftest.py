import uuid

import pytest
from fastapi.testclient import TestClient

from app import models
from app.db import SessionLocal, get_db
from app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    """Provides a SQLAlchemy session for tests."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_unique_user(role="user"):
    unique_id = str(uuid.uuid4())[:8]
    return {
        "username": f"{role}_{unique_id}",
        "email": f"{role}_{unique_id}@test.com",
        "password": "Test1234!",
        "role": role
    }


def delete_user_by_email(db, email):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        db.delete(user)
        db.commit()


@pytest.fixture
def admin_user(client, db_session):
    user_data = generate_unique_user(role="admin")
    client.post("/api/auth/register", json=user_data)  # role is passed here
    response = client.post(
        "/api/auth/login",
        data={"username": user_data["username"], "password": user_data["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    user_data["token"] = response.json()["access_token"]
    yield user_data
    delete_user_by_email(db_session, user_data["email"])



@pytest.fixture
def normal_user(client, db_session):
    user_data = generate_unique_user(role="user")
    client.post("/api/auth/register", json=user_data)
    response = client.post(
        "/api/auth/login",
        data={"username": user_data["username"], "password": user_data["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    user_data["token"] = response.json()["access_token"]
    yield user_data
    delete_user_by_email(db_session, user_data["email"])
