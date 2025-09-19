import uuid

import pytest


# ----------------- Sweet Fixtures -----------------
@pytest.fixture
def sample_sweet(client, admin_user):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    response = client.post("/api/sweets", json={
        "name": f"Chocolate_{uuid.uuid4().hex[:8]}",
        "category": "Candy",
        "price": 2.5,
        "quantity": 10
    }, headers=headers)
    data = response.json()
    yield data

    # Cleanup: delete the sweet
    client.delete(f"/api/sweets/{data['id']}", headers=headers)

# ----------------- Sweet Tests -----------------
def test_create_sweet(client, admin_user):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    response = client.post("/api/sweets", json={
        "name": f"Lollipop_{uuid.uuid4().hex[:8]}",
        "category": "Candy",
        "price": 1.5,
        "quantity": 20
    }, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"].startswith("Lollipop_")
    assert data["quantity"] == 20

    # Cleanup
    client.delete(f"/api/sweets/{data['id']}", headers=headers)

def test_create_sweet_non_admin(client, normal_user):
    headers = {"Authorization": f"Bearer {normal_user['token']}"}
    response = client.post("/api/sweets", json={
        "name": f"Gummy_{uuid.uuid4().hex[:8]}",
        "category": "Candy",
        "price": 1.0,
        "quantity": 15
    }, headers=headers)
    assert response.status_code == 403

def test_list_sweets(client, admin_user, sample_sweet):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    response = client.get("/api/sweets", headers=headers)
    assert response.status_code == 200
    assert any(s["id"] == sample_sweet["id"] for s in response.json())

def test_search_sweets(client, admin_user, sample_sweet):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    response = client.get(f"/api/sweets/search?name={sample_sweet['name'][:5]}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert any(sample_sweet["id"] == s["id"] for s in data)

def test_purchase_sweet(client, normal_user, sample_sweet):
    headers = {"Authorization": f"Bearer {normal_user['token']}"}
    sweet_id = sample_sweet["id"]
    response = client.post(f"/api/sweets/{sweet_id}/purchase", headers=headers)
    assert response.status_code == 200
    assert response.json()["quantity"] == sample_sweet["quantity"] - 1

def test_purchase_sweet_out_of_stock(client, admin_user, normal_user):
    headers_admin = {"Authorization": f"Bearer {admin_user['token']}"}
    response = client.post("/api/sweets", json={
        "name": f"EmptyCandy_{uuid.uuid4().hex[:8]}",
        "category": "Candy",
        "price": 1.0,
        "quantity": 0
    }, headers=headers_admin)
    sweet_id = response.json()["id"]

    headers_user = {"Authorization": f"Bearer {normal_user['token']}"}
    response = client.post(f"/api/sweets/{sweet_id}/purchase", headers=headers_user)
    assert response.status_code == 400
    assert response.json()["detail"] == "Sweet not available"

    # Cleanup
    client.delete(f"/api/sweets/{sweet_id}", headers=headers_admin)

def test_restock_sweet(client, admin_user, sample_sweet):
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    sweet_id = sample_sweet["id"]
    response = client.post(f"/api/sweets/{sweet_id}/restock?amount=5", headers=headers)
    assert response.status_code == 200
    assert response.json()["quantity"] == sample_sweet["quantity"] + 5

def test_restock_sweet_non_admin(client, normal_user, sample_sweet):
    headers = {"Authorization": f"Bearer {normal_user['token']}"}
    sweet_id = sample_sweet["id"]
    response = client.post(f"/api/sweets/{sweet_id}/restock?amount=5", headers=headers)
    assert response.status_code == 403
