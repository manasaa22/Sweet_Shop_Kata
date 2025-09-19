import pytest
from fastapi.testclient import TestClient

from app import models
from app.db import SessionLocal


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------ CREATE SWEET ------------------
def test_create_sweet_success(client: TestClient, admin_user):
    response = client.post(
        "/api/sweets/",
        headers={"Authorization": f"Bearer {admin_user['token']}"},
        json={"name": "Ladoo", "category": "Indian", "price": 10.0, "quantity": 5},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Ladoo"
    assert data["quantity"] == 5


def test_create_sweet_duplicate(client: TestClient, admin_user):
    sweet = {"name": "Jalebi", "category": "Indian", "price": 5.0, "quantity": 5}
    client.post("/api/sweets/", headers={"Authorization": f"Bearer {admin_user['token']}"}, json=sweet)
    response = client.post("/api/sweets/", headers={"Authorization": f"Bearer {admin_user['token']}"}, json=sweet)
    assert response.status_code == 400
    assert response.json()["detail"] == "Sweet already exists"


# ------------------ LIST SWEETS ------------------
def test_list_sweets(client: TestClient, normal_user):
    response = client.get("/api/sweets/", headers={"Authorization": f"Bearer {normal_user['token']}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ------------------ UPDATE SWEET ------------------
def test_update_sweet_success(client: TestClient, admin_user, db_session):
    sweet = models.Sweet(name="UpdateMe", category="Test", price=1.0, quantity=1)
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)

    response = client.patch(
        f"/api/sweets/{sweet.id}",
        headers={"Authorization": f"Bearer {admin_user['token']}"},
        json={"price": 20.0, "quantity": 10},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 20.0
    assert data["quantity"] == 10


def test_update_sweet_not_found(client: TestClient, admin_user):
    response = client.patch(
        "/api/sweets/9999",
        headers={"Authorization": f"Bearer {admin_user['token']}"},
        json={"price": 5.0},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Sweet not found"


# ------------------ DELETE SWEET ------------------
def test_delete_sweet_success(client: TestClient, admin_user, db_session):
    sweet = models.Sweet(name="DeleteMe", category="Test", price=2.0, quantity=2)
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)

    response = client.delete(
        f"/api/sweets/{sweet.id}", headers={"Authorization": f"Bearer {admin_user['token']}"}
    )
    assert response.status_code == 204


def test_delete_sweet_not_found(client: TestClient, admin_user):
    response = client.delete("/api/sweets/9999", headers={"Authorization": f"Bearer {admin_user['token']}"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Sweet not found"


# ------------------ SEARCH SWEETS ------------------
def test_search_sweets_by_name(client: TestClient, admin_user, db_session):
    res = client.post(
    "/api/sweets/",
    headers={"Authorization": f"Bearer {admin_user['token']}"},
    json={"name": "SearchMe", "category": "Special", "price": 15.0, "quantity": 3}
)
    assert res.status_code == 201


    response = client.get(
        "/api/sweets/search?name=SearchMe", headers={"Authorization": f"Bearer {admin_user['token']}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert any(s["name"] == "SearchMe" for s in data)


def test_search_sweets_by_category(client: TestClient, normal_user):
    response = client.get(
        "/api/sweets/search?category=Indian", headers={"Authorization": f"Bearer {normal_user['token']}"}
    )
    assert response.status_code == 200


def test_search_sweets_by_price_range(client: TestClient, normal_user):
    response = client.get(
        "/api/sweets/search?min_price=1&max_price=100",
        headers={"Authorization": f"Bearer {normal_user['token']}"},
    )
    assert response.status_code == 200


def test_search_sweets_no_results(client: TestClient, normal_user):
    response = client.get(
        "/api/sweets/search?name=DoesNotExist", headers={"Authorization": f"Bearer {normal_user['token']}"}
    )
    assert response.status_code == 200
    assert response.json() == []


# ------------------ PURCHASE SWEET ------------------
def test_purchase_sweet_success(client: TestClient, normal_user, db_session):
    sweet = models.Sweet(name="BuyMe", category="Snack", price=5.0, quantity=2)
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)

    response = client.post(
        f"/api/sweets/{sweet.id}/purchase", headers={"Authorization": f"Bearer {normal_user['token']}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 1


def test_purchase_sweet_not_available(client: TestClient, normal_user, db_session):
    sweet = models.Sweet(name="SoldOut", category="Snack", price=5.0, quantity=0)
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)

    response = client.post(
        f"/api/sweets/{sweet.id}/purchase", headers={"Authorization": f"Bearer {normal_user['token']}"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Sweet not available"


def test_purchase_sweet_not_found(client: TestClient, normal_user):
    response = client.post("/api/sweets/9999/purchase", headers={"Authorization": f"Bearer {normal_user['token']}"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Sweet not available"


# ------------------ RESTOCK SWEET ------------------
def test_restock_sweet_success(client: TestClient, admin_user, db_session):
    sweet = models.Sweet(name="RestockMe", category="Snack", price=5.0, quantity=1)
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)

    response = client.post(
        f"/api/sweets/{sweet.id}/restock?amount=5", headers={"Authorization": f"Bearer {admin_user['token']}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 6


def test_restock_sweet_negative_amount(client: TestClient, admin_user, db_session):
    sweet = models.Sweet(name="BadRestock", category="Snack", price=5.0, quantity=1)
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)

    response = client.post(
        f"/api/sweets/{sweet.id}/restock?amount=-1", headers={"Authorization": f"Bearer {admin_user['token']}"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Restock amount must be positive"


def test_restock_sweet_not_found(client: TestClient, admin_user):
    response = client.post(
        "/api/sweets/9999/restock?amount=5", headers={"Authorization": f"Bearer {admin_user['token']}"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Sweet not found"
