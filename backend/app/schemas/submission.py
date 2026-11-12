from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse

class SubmissionFileResponse(BaseModel):
    id: str
    submission_id: str
    file_name: str
    file_path: str
    file_size: int
    file_type: str
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SubmissionCreate(BaseModel):
    live_url: Optional[str] = None
    notes: Optional[str] = None

class SubmissionResponse(BaseModel):
    id: str
    milestone_id: str
    freelancer_id: str
    live_url: Optional[str] = None
    notes: Optional[str] = None
    version: int
    status: str
    created_at: datetime
    freelancer: Optional[UserResponse] = None
    files: List[SubmissionFileResponse] = []

    model_config = ConfigDict(from_attributes=True)
