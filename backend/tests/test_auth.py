import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "paypal_mode" in data

def test_user_registration_and_login():
    email = "test_fintech_user@proofpay.io"
    payload = {
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Taylor Morgan",
        "role": "client",
        "company_name": "Fintech Horizons Inc"
    }

    # Register
    reg_res = client.post("/api/v1/auth/register", json=payload)
    if reg_res.status_code == 400:
        # Already registered in previous run
        pass
    else:
        assert reg_res.status_code == 200
        data = reg_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == email
        assert data["user"]["role"] == "client"

    # Login
    login_res = client.post("/api/v1/auth/login", json={"email": email, "password": "SecurePassword123!"})
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Profile
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == email
    assert me_data["role"] == "client"
