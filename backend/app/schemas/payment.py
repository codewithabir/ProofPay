from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class OrderCreateResponse(BaseModel):
    order_id: str
    status: str
    approve_url: Optional[str] = None
    milestone_id: str
    amount: Decimal
    currency: str

class PaymentAuthorizeRequest(BaseModel):
    order_id: str

class PaymentCaptureRequest(BaseModel):
    note: Optional[str] = "Milestone deliverable approved by client"

class PaymentRefundRequest(BaseModel):
    reason: str
    amount: Optional[Decimal] = None

class PaymentEventResponse(BaseModel):
    id: str
    payment_id: str
    event_type: str
    paypal_event_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaymentResponse(BaseModel):
    id: str
    milestone_id: str
    client_id: str
    freelancer_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    paypal_order_id: Optional[str] = None
    paypal_authorization_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    paypal_refund_id: Optional[str] = None
    authorization_expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    events: List[PaymentEventResponse] = []

    model_config = ConfigDict(from_attributes=True)
