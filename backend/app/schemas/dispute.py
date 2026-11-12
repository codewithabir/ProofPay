from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class DisputeCreateRequest(BaseModel):
    milestone_id: str
    client_reason: str

class DisputeResponse(BaseModel):
    id: str
    milestone_id: str
    submission_id: Optional[str] = None
    client_id: str
    freelancer_id: str
    client_reason: str
    ai_summary: Optional[str] = None
    disagreements: Optional[List[str]] = []
    recommended_evidence: Optional[List[str]] = []
    suggested_revisions: Optional[List[str]] = []
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
