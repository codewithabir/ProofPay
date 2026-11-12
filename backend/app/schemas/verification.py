from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal

class CriteriaItem(BaseModel):
    requirement: str
    status: str  # fulfilled, partially_fulfilled, missing, unverifiable
    confidence: float
    evidence: List[str] = []
    explanation: str
    weight: Optional[float] = 1.0

class VerificationEngineOutput(BaseModel):
    overall_score: int
    summary: str
    criteria: List[CriteriaItem]
    missing_requirements: List[str] = []
    potential_issues: List[str] = []
    recommendations: List[str] = []
    limitations: List[str] = []
    requires_human_review: bool = False

class VerificationCriteriaResponse(BaseModel):
    id: str
    requirement: str
    status: str
    confidence: float
    evidence_references: Optional[str] = None
    explanation: str
    weight: float

    model_config = ConfigDict(from_attributes=True)

class VerificationReportResponse(BaseModel):
    id: str
    milestone_id: str
    submission_id: str
    overall_score: float
    summary: str
    requires_human_review: bool
    created_at: datetime
    criteria: List[VerificationCriteriaResponse] = []
    details: Optional[VerificationEngineOutput] = None

    model_config = ConfigDict(from_attributes=True)
