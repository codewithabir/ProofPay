from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectRequirement
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, RequirementCreate
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, require_client
from app.services.audit_service import log_audit, create_notification

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    project = Project(
        title=project_in.title,
        description=project_in.description,
        client_id=current_user.id,
        freelancer_id=project_in.freelancer_id,
        budget=project_in.budget,
        currency=project_in.currency,
        deadline=project_in.deadline,
        status="active"
    )
    db.add(project)
    db.flush()

    for req_in in project_in.requirements:
        req = ProjectRequirement(
            project_id=project.id,
            title=req_in.title,
            description=req_in.description,
            category=req_in.category,
            weight=req_in.weight,
            is_mandatory=req_in.is_mandatory
        )
        db.add(req)

    db.commit()
    db.refresh(project)

    log_audit(db, action="PROJECT_CREATED", resource_type="Project", resource_id=project.id, user_id=current_user.id)

    if project.freelancer_id:
        create_notification(
            db,
            user_id=project.freelancer_id,
            title="Assigned to Project",
            message=f"You have been assigned to project: {project.title}",
            notif_type="project_assigned",
            related_id=project.id
        )

    return project

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "client":
        projects = db.query(Project).filter(Project.client_id == current_user.id).order_by(Project.created_at.desc()).all()
    else:
        # Freelancer views assigned projects or open projects
        projects = db.query(Project).filter(
            (Project.freelancer_id == current_user.id) | (Project.freelancer_id.is_(None))
        ).order_by(Project.created_at.desc()).all()
    return projects

@router.get("/freelancers/available", response_model=List[UserResponse])
def get_available_freelancers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    freelancers = db.query(User).filter(User.role == "freelancer").all()
    return freelancers

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role == "client" and project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    project = db.query(Project).filter(Project.id == project_id, Project.client_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = project_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(project, field, val)

    db.commit()
    db.refresh(project)

    log_audit(db, action="PROJECT_UPDATED", resource_type="Project", resource_id=project.id, user_id=current_user.id)
    return project

@router.post("/{project_id}/assign")
def assign_freelancer(
    project_id: str,
    freelancer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    project = db.query(Project).filter(Project.id == project_id, Project.client_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    freelancer = db.query(User).filter(User.id == freelancer_id, User.role == "freelancer").first()
    if not freelancer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Freelancer user not found")

    project.freelancer_id = freelancer.id
    db.commit()

    log_audit(db, action="FREELANCER_ASSIGNED", resource_type="Project", resource_id=project.id, user_id=current_user.id)
    create_notification(
        db,
        user_id=freelancer.id,
        title="Assigned to Project",
        message=f"You have been assigned to project: {project.title}",
        notif_type="project_assigned",
        related_id=project.id
    )

    return {"status": "success", "message": f"Freelancer {freelancer.full_name} assigned to project"}
