import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requirements_text = Column(Text, nullable=True)
    payment_amount = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    currency = Column(String(3), nullable=False, default="USD")
    deadline = Column(DateTime, nullable=True)

    # Workflow Statuses
    submission_status = Column(String(50), nullable=False, default="pending")  
    # pending, submitted, resubmission_requested
    
    ai_verification_status = Column(String(50), nullable=False, default="not_started")  
    # not_started, processing, verified, flagged_human_review
    
    client_approval_status = Column(String(50), nullable=False, default="pending_authorization")  
    # pending_authorization, authorized, in_review, revision_requested, approved, rejected

    # PayPal Metadata
    paypal_order_id = Column(String(100), nullable=True, index=True)
    paypal_authorization_id = Column(String(100), nullable=True, index=True)
    paypal_capture_id = Column(String(100), nullable=True, index=True)
    authorization_expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    project = relationship("Project", back_populates="milestones")
    submissions = relationship("MilestoneSubmission", back_populates="milestone", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="milestone", cascade="all, delete-orphan")
    disputes = relationship("Dispute", back_populates="milestone", cascade="all, delete-orphan")
