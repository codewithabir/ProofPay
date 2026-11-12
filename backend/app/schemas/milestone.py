from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    requirements_text: Optional[str] = None
    payment_amount: Decimal = Decimal("0.00")
    currency: str = "USD"
    deadline: Optional[datetime] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements_text: Optional[str] = None
    payment_amount: Optional[Decimal] = None
    deadline: Optional[datetime] = None
    submission_status: Optional[str] = None
    ai_verification_status: Optional[str] = None
    client_approval_status: Optional[str] = None

class MilestoneResponse(MilestoneBase):
    id: str
    project_id: str
    submission_status: str
    ai_verification_status: str
    client_approval_status: str
    paypal_order_id: Optional[str] = None
    paypal_authorization_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    authorization_expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
