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
def test_search_sweets_by_name(client: TestClient, normal_user, db_session):
    sweet = models.Sweet(name="SearchMe", category="Special", price=15.0, quantity=3)
    db_session.add(sweet)
    db_session.commit()
    db_session.refresh(sweet)

    response = client.get(
        "/api/sweets/search?name=SearchMe", headers={"Authorization": f"Bearer {normal_user['token']}"}
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


# ---------------------- CREATE SWEET ERRORS ----------------------
def test_create_sweet_duplicate_name(client, admin_user):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    sweet_data = {"name": "Ladoo", "category": "Indian", "price": 10.0, "quantity": 5}

    # First creation should succeed
    res1 = client.post("/api/sweets/", json=sweet_data, headers=headers)
    assert res1.status_code == 201

    # Duplicate creation should fail
    res2 = client.post("/api/sweets/", json=sweet_data, headers=headers)
    assert res2.status_code == 400
    assert res2.json()["detail"] == "Sweet already exists"


# ---------------------- UPDATE SWEET ERRORS ----------------------
def test_update_nonexistent_sweet(client, admin_user):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    res = client.patch("/api/sweets/9999", json={"price": 50}, headers=headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "Sweet not found"


# ---------------------- DELETE SWEET ERRORS ----------------------
def test_delete_nonexistent_sweet(client, admin_user):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    res = client.delete("/api/sweets/9999", headers=headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "Sweet not found"


# ---------------------- PURCHASE ERRORS ----------------------
def test_purchase_sweet_not_found(client, normal_user):
    headers = {"Authorization": f"Bearer {normal_user['token']}"}
    res = client.post("/api/sweets/9999/purchase", headers=headers)
    assert res.status_code == 400
    assert res.json()["detail"] == "Sweet not available"


def test_purchase_sweet_out_of_stock(client, admin_user, normal_user):
    headers_admin = {"Authorization": f"Bearer {admin_user['token']}"}
    headers_user = {"Authorization": f"Bearer {normal_user['token']}"}

    sweet_data = {"name": "EmptySweet", "category": "None", "price": 5.0, "quantity": 0}
    res = client.post("/api/sweets/", json=sweet_data, headers=headers_admin)
    sweet_id = res.json()["id"]

    res2 = client.post(f"/api/sweets/{sweet_id}/purchase", headers=headers_user)
    assert res2.status_code == 400
    assert res2.json()["detail"] == "Sweet not available"


# ---------------------- RESTOCK ERRORS ----------------------
def test_restock_nonexistent_sweet(client, admin_user):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    res = client.post("/api/sweets/9999/restock?amount=10", headers=headers)
    assert res.status_code == 404
    assert res.json()["detail"] == "Sweet not found"


def test_restock_invalid_amount(client, admin_user):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    sweet_data = {"name": "Toffee", "category": "Candy", "price": 2.0, "quantity": 10}
    res = client.post("/api/sweets/", json=sweet_data, headers=headers)
    sweet_id = res.json()["id"]

    res2 = client.post(f"/api/sweets/{sweet_id}/restock?amount=0", headers=headers)
    assert res2.status_code == 400
    assert res2.json()["detail"] == "Restock amount must be positive"


# ---------------------- SEARCH EDGE CASES ----------------------
def test_search_by_category_and_price_range(client, admin_user, normal_user):
    headers_admin = {"Authorization": f"Bearer {admin_user['token']}"}
    headers_user = {"Authorization": f"Bearer {normal_user['token']}"}

    # Add test sweets
    sweet1 = {"name": "KajuKatli", "category": "Mithai", "price": 100.0, "quantity": 10}
    sweet2 = {"name": "Rasgulla", "category": "Mithai", "price": 50.0, "quantity": 10}
    sweet3 = {"name": "Jelly", "category": "Candy", "price": 20.0, "quantity": 10}

    for sweet in (sweet1, sweet2, sweet3):
        client.post("/api/sweets/", json=sweet, headers=headers_admin)

    # Search mithai between 30 and 120 → should return sweet1 & sweet2
    res = client.get(
        "/api/sweets/search?category=Mithai&min_price=30&max_price=120",
        headers=headers_user,
    )
    assert res.status_code == 200
    results = [s["name"] for s in res.json()]
    assert "KajuKatli" in results
    assert "Rasgulla" in results
    assert "Jelly" not in results