import json
import uuid
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.milestone import Milestone
from app.models.payment import Payment, PaymentEvent
from app.schemas.payment import (
    OrderCreateResponse,
    PaymentAuthorizeRequest,
    PaymentCaptureRequest,
    PaymentRefundRequest,
    PaymentResponse
)
from app.api.deps import get_current_user, require_client
from app.services.paypal_service import paypal_service
from app.services.audit_service import log_audit, create_notification

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/{milestone_id}/create-order", response_model=OrderCreateResponse)
async def create_payment_order(
    milestone_id: str,
    idempotency_key: Optional[str] = Header(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone or milestone.project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    # Idempotency check
    key = idempotency_key or f"order_{milestone.id}_{uuid.uuid4().hex[:8]}"
    existing_payment = db.query(Payment).filter(Payment.idempotency_key == key).first()
    if existing_payment and existing_payment.paypal_order_id:
        return OrderCreateResponse(
            order_id=existing_payment.paypal_order_id,
            status=existing_payment.status,
            approve_url=f"https://www.sandbox.paypal.com/checkoutnow?token={existing_payment.paypal_order_id}",
            milestone_id=milestone.id,
            amount=existing_payment.amount,
            currency=existing_payment.currency
        )

    # Call PayPal Orders v2 with intent: AUTHORIZE
    order_data = await paypal_service.create_authorization_order(
        milestone_id=milestone.id,
        amount=milestone.payment_amount,
        currency=milestone.currency
    )

    # Create/update Payment record
    payment = Payment(
        milestone_id=milestone.id,
        client_id=current_user.id,
        freelancer_id=milestone.project.freelancer_id,
        amount=milestone.payment_amount,
        currency=milestone.currency,
        status="created",
        paypal_order_id=order_data["order_id"],
        idempotency_key=key
    )
    db.add(payment)
    db.flush()

    db.add(
        PaymentEvent(
            payment_id=payment.id,
            event_type="ORDER_CREATED",
            paypal_event_id=order_data["order_id"],
            payload=json.dumps(order_data)
        )
    )

    milestone.paypal_order_id = order_data["order_id"]
    db.commit()

    log_audit(db, action="PAYPAL_ORDER_CREATED", resource_type="Payment", resource_id=payment.id, user_id=current_user.id)

    return OrderCreateResponse(
        order_id=order_data["order_id"],
        status=order_data["status"],
        approve_url=order_data.get("approve_url"),
        milestone_id=milestone.id,
        amount=milestone.payment_amount,
        currency=milestone.currency
    )

@router.post("/{milestone_id}/authorize", response_model=PaymentResponse)
async def authorize_payment_order(
    milestone_id: str,
    auth_in: PaymentAuthorizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone or milestone.project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    payment = db.query(Payment).filter(Payment.milestone_id == milestone.id).order_by(Payment.created_at.desc()).first()
    if not payment:
        payment = Payment(
            milestone_id=milestone.id,
            client_id=current_user.id,
            freelancer_id=milestone.project.freelancer_id,
            amount=milestone.payment_amount,
            currency=milestone.currency,
            status="created",
            paypal_order_id=auth_in.order_id
        )
        db.add(payment)
        db.flush()

    # Authorize PayPal Order
    auth_res = await paypal_service.authorize_order(auth_in.order_id)
    auth_id = auth_res["authorization_id"]
    expires_at = auth_res["expires_at"]

    payment.status = "authorized"
    payment.paypal_authorization_id = auth_id
    payment.authorization_expires_at = expires_at

    milestone.paypal_authorization_id = auth_id
    milestone.authorization_expires_at = expires_at
    milestone.client_approval_status = "authorized"

    db.add(
        PaymentEvent(
            payment_id=payment.id,
            event_type="PAYMENT_AUTHORIZED",
            paypal_event_id=auth_id,
            payload=json.dumps(auth_res, default=str)
        )
    )

    db.commit()
    db.refresh(payment)

    log_audit(db, action="PAYMENT_AUTHORIZED", resource_type="Payment", resource_id=payment.id, user_id=current_user.id)

    # Notify freelancer
    if milestone.project.freelancer_id:
        create_notification(
            db,
            user_id=milestone.project.freelancer_id,
            title="Milestone Payment Authorized",
            message=f"Client authorized ${milestone.payment_amount} for milestone '{milestone.title}'. You may proceed with work.",
            notif_type="milestone_authorized",
            related_id=milestone.id
        )

    return payment

@router.post("/{payment_id}/capture", response_model=PaymentResponse)
async def capture_payment(
    payment_id: str,
    req: PaymentCaptureRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.client_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if not payment.paypal_authorization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No authorization exists for capture")

    capture_res = await paypal_service.capture_authorization(
        authorization_id=payment.paypal_authorization_id,
        amount=payment.amount,
        currency=payment.currency,
        note=req.note or "Milestone deliverable captured"
    )

    payment.status = "captured"
    payment.paypal_capture_id = capture_res.get("capture_id")

    if payment.milestone:
        payment.milestone.client_approval_status = "approved"
        payment.milestone.paypal_capture_id = payment.paypal_capture_id

    db.add(
        PaymentEvent(
            payment_id=payment.id,
            event_type="PAYMENT_CAPTURED",
            paypal_event_id=payment.paypal_capture_id,
            payload=json.dumps(capture_res)
        )
    )

    db.commit()
    db.refresh(payment)

    log_audit(db, action="PAYMENT_CAPTURED", resource_type="Payment", resource_id=payment.id, user_id=current_user.id)
    return payment

@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: str,
    refund_in: PaymentRefundRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.client_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if not payment.paypal_capture_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot refund uncaptured payment")

    refund_res = await paypal_service.refund_capture(
        capture_id=payment.paypal_capture_id,
        amount=refund_in.amount or payment.amount,
        currency=payment.currency,
        note=refund_in.reason
    )

    payment.status = "refunded"
    payment.paypal_refund_id = refund_res.get("refund_id")

    db.add(
        PaymentEvent(
            payment_id=payment.id,
            event_type="PAYMENT_REFUNDED",
            paypal_event_id=payment.paypal_refund_id,
            payload=json.dumps(refund_res)
        )
    )

    db.commit()
    db.refresh(payment)

    log_audit(db, action="PAYMENT_REFUNDED", resource_type="Payment", resource_id=payment.id, user_id=current_user.id)
    return payment

@router.get("/history", response_model=List[PaymentResponse])
def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "client":
        payments = db.query(Payment).filter(Payment.client_id == current_user.id).order_by(Payment.created_at.desc()).all()
    else:
        payments = db.query(Payment).filter(Payment.freelancer_id == current_user.id).order_by(Payment.created_at.desc()).all()
    return payments
