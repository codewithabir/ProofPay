import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    freelancer_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    amount = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(String(50), nullable=False, default="created")  
    # created, authorized, captured, refunded, failed, expired
    
    paypal_order_id = Column(String(100), nullable=True, index=True)
    paypal_authorization_id = Column(String(100), nullable=True, index=True)
    paypal_capture_id = Column(String(100), nullable=True, index=True)
    paypal_refund_id = Column(String(100), nullable=True, index=True)
    authorization_expires_at = Column(DateTime, nullable=True)
    idempotency_key = Column(String(64), unique=True, nullable=True, index=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    milestone = relationship("Milestone", back_populates="payments")
    client = relationship("User", foreign_keys=[client_id])
    freelancer = relationship("User", foreign_keys=[freelancer_id])
    events = relationship("PaymentEvent", back_populates="payment", cascade="all, delete-orphan")


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    payment_id = Column(String(36), ForeignKey("payments.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # ORDER_CREATED, PAYMENT_AUTHORIZED, PAYMENT_CAPTURED, etc.
    paypal_event_id = Column(String(100), nullable=True)
    payload = Column(Text, nullable=True)  # JSON payload
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    payment = relationship("Payment", back_populates="events")
