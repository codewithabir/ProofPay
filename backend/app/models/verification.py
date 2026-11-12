import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, String, Text, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class VerificationReport(Base):
    __tablename__ = "verification_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=False, index=True)
    submission_id = Column(String(36), ForeignKey("milestone_submissions.id"), nullable=False, index=True)
    overall_score = Column(Numeric(5, 2), nullable=False, default=Decimal("0.00"))
    summary = Column(Text, nullable=False)
    requires_human_review = Column(Boolean, nullable=False, default=False)
    raw_response = Column(Text, nullable=True)  # JSON-encoded raw evaluation
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    milestone = relationship("Milestone")
    submission = relationship("MilestoneSubmission", back_populates="verification_reports")
    criteria = relationship("VerificationCriteria", back_populates="report", cascade="all, delete-orphan")


class VerificationCriteria(Base):
    __tablename__ = "verification_criteria"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("verification_reports.id"), nullable=False, index=True)
    requirement = Column(Text, nullable=False)
    status = Column(String(50), nullable=False)  # fulfilled, partially_fulfilled, missing, unverifiable
    confidence = Column(Numeric(4, 3), nullable=False, default=Decimal("1.000"))
    evidence_references = Column(Text, nullable=True)  # JSON list of file names / URLs
    explanation = Column(Text, nullable=False)
    weight = Column(Numeric(4, 2), nullable=False, default=Decimal("1.00"))

    report = relationship("VerificationReport", back_populates="criteria")
