import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=False, index=True)
    submission_id = Column(String(36), ForeignKey("milestone_submissions.id"), nullable=True, index=True)
    client_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    freelancer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    client_reason = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    disagreements = Column(Text, nullable=True)           # JSON list of specific disagreement points
    recommended_evidence = Column(Text, nullable=True)    # JSON list of suggested proof
    suggested_revisions = Column(Text, nullable=True)     # JSON list of actionable tasks
    status = Column(String(50), nullable=False, default="open")  # open, resolved, escalated

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    milestone = relationship("Milestone", back_populates="disputes")
    client = relationship("User", foreign_keys=[client_id])
    freelancer = relationship("User", foreign_keys=[freelancer_id])
