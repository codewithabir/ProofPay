import json
import logging
from fastapi import APIRouter, Request, Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.paypal_service import paypal_service
from app.models.payment import Payment, PaymentEvent
from app.models.milestone import Milestone

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/paypal")
async def handle_paypal_webhook(request: Request, db: Session = Depends(get_db)):
    body_bytes = await request.body()
    headers = dict(request.headers)

    # Verify signature
    is_valid = await paypal_service.verify_webhook_signature(headers, body_bytes)
    if not is_valid:
        logger.warning("Invalid PayPal webhook signature rejected")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    try:
        event = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Malformed JSON payload")

    event_type = event.get("event_type", "UNKNOWN")
    resource = event.get("resource", {})
    resource_id = resource.get("id")

    logger.info(f"Received verified PayPal webhook: {event_type} - {resource_id}")

    # Process events idempotently
    if event_type == "PAYMENT.CAPTURE.COMPLETED":
        # Find payment by capture id or authorization id
        parent_auth = resource.get("custom_id") or resource.get("parent_payment")
        payment = db.query(Payment).filter(
            (Payment.paypal_capture_id == resource_id) | (Payment.paypal_authorization_id == parent_auth)
        ).first()
        if payment:
            payment.status = "captured"
            payment.paypal_capture_id = resource_id
            db.add(
                PaymentEvent(
                    payment_id=payment.id,
                    event_type=event_type,
                    paypal_event_id=event.get("id"),
                    payload=json.dumps(event)
                )
            )
            db.commit()

    elif event_type == "PAYMENT.AUTHORIZATION.CREATED":
        order_id = resource.get("supplementary_data", {}).get("related_ids", {}).get("order_id")
        payment = db.query(Payment).filter(Payment.paypal_order_id == order_id).first()
        if payment:
            payment.status = "authorized"
            payment.paypal_authorization_id = resource_id
            db.add(
                PaymentEvent(
                    payment_id=payment.id,
                    event_type=event_type,
                    paypal_event_id=event.get("id"),
                    payload=json.dumps(event)
                )
            )
            db.commit()

    return {"status": "success", "event_type": event_type}
