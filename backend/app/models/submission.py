import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class MilestoneSubmission(Base):
    __tablename__ = "milestone_submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=False, index=True)
    freelancer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    live_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    version = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default="submitted")  # submitted, under_review, revision_needed, accepted
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    milestone = relationship("Milestone", back_populates="submissions")
    freelancer = relationship("User", foreign_keys=[freelancer_id])
    files = relationship("SubmissionFile", back_populates="submission", cascade="all, delete-orphan")
    verification_reports = relationship("VerificationReport", back_populates="submission", cascade="all, delete-orphan")


class SubmissionFile(Base):
    __tablename__ = "submission_files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("milestone_submissions.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False, default="screenshot")  # screenshot, code, document
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    submission = relationship("MilestoneSubmission", back_populates="files")
