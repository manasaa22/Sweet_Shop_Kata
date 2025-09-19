import uuid

import pytest


def test_register_user(client, db_session):
    user_data = {
        "username": "test_register_user",
        "email": f"test_register_user_{uuid.uuid4().hex[:8]}@test.com",
        "password": "Test1234!"
    }
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]

    # Cleanup
    from app.models import User
    user = db_session.query(User).filter(User.email == user_data["email"]).first()
    if user:
        db_session.delete(user)
        db_session.commit()

def test_register_duplicate_user(client, normal_user):
    # normal_user fixture already creates a user
    response = client.post("/api/auth/register", json={
        "username": normal_user["username"],
        "email": normal_user["email"],
        "password": normal_user["password"]
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client, normal_user):
    response = client.post(
        "/api/auth/login",
        data={"username": normal_user["username"], "password": normal_user["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, normal_user):
    response = client.post(
        "/api/auth/login",
        data={"username": normal_user["username"], "password": "WrongPassword!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "nonexistent_user", "password": "pass123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"
