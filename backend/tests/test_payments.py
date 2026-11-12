import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.services.paypal_service import paypal_service

client = TestClient(app)

@pytest.mark.asyncio
async def test_paypal_orders_v2_flow():
    # 1. Create order
    order = await paypal_service.create_authorization_order(
        milestone_id="test_ms_001",
        amount=Decimal("100.00"),
        currency="USD"
    )
    assert "order_id" in order
    assert order["intent"] == "AUTHORIZE"
    order_id = order["order_id"]

    # 2. Authorize payment
    auth = await paypal_service.authorize_order(order_id)
    assert "authorization_id" in auth
    assert "expires_at" in auth
    auth_id = auth["authorization_id"]

    # 3. Capture authorized payment
    capture = await paypal_service.capture_authorization(
        authorization_id=auth_id,
        amount=Decimal("100.00"),
        currency="USD",
        note="Approved milestone deliverable"
    )
    assert "capture_id" in capture
    assert capture["status"] == "COMPLETED"
    capture_id = capture["capture_id"]

    # 4. Refund capture
    refund = await paypal_service.refund_capture(
        capture_id=capture_id,
        amount=Decimal("100.00"),
        currency="USD",
        note="Customer requested refund"
    )
    assert "refund_id" in refund
    assert refund["status"] == "COMPLETED"
