import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.milestone import Milestone
from app.models.submission import MilestoneSubmission
from app.models.dispute import Dispute
from app.schemas.dispute import DisputeCreateRequest, DisputeResponse
from app.api.deps import get_current_user, require_client
from app.services.ai_dispute import ai_dispute_assistant
from app.services.audit_service import log_audit, create_notification

router = APIRouter(prefix="/disputes", tags=["Disputes"])

@router.post("", response_model=DisputeResponse)
async def create_dispute(
    req: DisputeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestone = db.query(Milestone).filter(Milestone.id == req.milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    project = milestone.project
    if current_user.id not in [project.client_id, project.freelancer_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    latest_submission = (
        db.query(MilestoneSubmission)
        .filter(MilestoneSubmission.milestone_id == milestone.id)
        .order_by(MilestoneSubmission.created_at.desc())
        .first()
    )

    project_req_titles = [r.title for r in project.requirements]
    submitted_files = [f.file_name for f in latest_submission.files] if latest_submission else []

    # Run AI Dispute Assistant
    analysis = await ai_dispute_assistant.analyze_dispute(
        project_title=project.title,
        project_requirements=project_req_titles,
        milestone_title=milestone.title,
        submission_notes=latest_submission.notes if latest_submission else None,
        submitted_files=submitted_files,
        client_reason=req.client_reason
    )

    dispute = Dispute(
        milestone_id=milestone.id,
        submission_id=latest_submission.id if latest_submission else None,
        client_id=project.client_id,
        freelancer_id=project.freelancer_id or current_user.id,
        client_reason=req.client_reason,
        ai_summary=analysis.get("ai_summary"),
        disagreements=json.dumps(analysis.get("disagreements", [])),
        recommended_evidence=json.dumps(analysis.get("recommended_evidence", [])),
        suggested_revisions=json.dumps(analysis.get("suggested_revisions", [])),
        status="open"
    )
    db.add(dispute)
    milestone.client_approval_status = "revision_requested"
    db.commit()
    db.refresh(dispute)

    log_audit(db, action="DISPUTE_INITIATED", resource_type="Dispute", resource_id=dispute.id, user_id=current_user.id)

    # Notify counterpart
    other_party_id = project.freelancer_id if current_user.id == project.client_id else project.client_id
    if other_party_id:
        create_notification(
            db,
            user_id=other_party_id,
            title="Dispute Opened / Revision Analysis Ready",
            message=f"A dispute/revision review was opened for '{milestone.title}'. AI mediation suggestions are ready.",
            notif_type="revision_requested",
            related_id=dispute.id
        )

    res = DisputeResponse.model_validate(dispute)
    res.disagreements = analysis.get("disagreements", [])
    res.recommended_evidence = analysis.get("recommended_evidence", [])
    res.suggested_revisions = analysis.get("suggested_revisions", [])
    return res

@router.get("/{dispute_id}", response_model=DisputeResponse)
def get_dispute(
    dispute_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found")

    res = DisputeResponse.model_validate(dispute)
    if dispute.disagreements:
        res.disagreements = json.loads(dispute.disagreements)
    if dispute.recommended_evidence:
        res.recommended_evidence = json.loads(dispute.recommended_evidence)
    if dispute.suggested_revisions:
        res.suggested_revisions = json.loads(dispute.suggested_revisions)
    return res

@router.get("", response_model=List[DisputeResponse])
def list_disputes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "client":
        disputes = db.query(Dispute).filter(Dispute.client_id == current_user.id).order_by(Dispute.created_at.desc()).all()
    else:
        disputes = db.query(Dispute).filter(Dispute.freelancer_id == current_user.id).order_by(Dispute.created_at.desc()).all()

    results = []
    for d in disputes:
        res = DisputeResponse.model_validate(d)
        res.disagreements = json.loads(d.disagreements) if d.disagreements else []
        res.recommended_evidence = json.loads(d.recommended_evidence) if d.recommended_evidence else []
        res.suggested_revisions = json.loads(d.suggested_revisions) if d.suggested_revisions else []
        results.append(res)
    return results
