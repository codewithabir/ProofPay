from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.schemas.user import UserResponse

class RequirementBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "functional"  # functional, ui_ux, performance, security
    weight: Decimal = Decimal("1.00")
    is_mandatory: bool = True

class RequirementCreate(RequirementBase):
    pass

class RequirementResponse(RequirementBase):
    id: str
    project_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    budget: Decimal = Decimal("0.00")
    currency: str = "USD"
    deadline: Optional[datetime] = None

class ProjectCreate(ProjectBase):
    freelancer_id: Optional[str] = None
    requirements: List[RequirementCreate] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    freelancer_id: Optional[str] = None
    budget: Optional[Decimal] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None

class ProjectResponse(ProjectBase):
    id: str
    client_id: str
    freelancer_id: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    client: Optional[UserResponse] = None
    freelancer: Optional[UserResponse] = None
    requirements: List[RequirementResponse] = []

    model_config = ConfigDict(from_attributes=True)
