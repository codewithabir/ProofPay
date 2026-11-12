import json
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectRequirement
from app.models.milestone import Milestone
from app.models.submission import MilestoneSubmission, SubmissionFile
from app.models.verification import VerificationReport, VerificationCriteria
from app.models.payment import Payment, PaymentEvent
from app.schemas.milestone import MilestoneCreate, MilestoneResponse, MilestoneUpdate
from app.schemas.submission import SubmissionResponse
from app.schemas.verification import VerificationReportResponse, VerificationEngineOutput
from app.api.deps import get_current_user, require_client, require_freelancer
from app.services.storage_service import storage_service
from app.services.ai_verifier import ai_verification_engine
from app.services.paypal_service import paypal_service
from app.services.audit_service import log_audit, create_notification

router = APIRouter(tags=["Milestones"])

@router.post("/projects/{project_id}/milestones", response_model=MilestoneResponse)
def create_milestone(
    project_id: str,
    milestone_in: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    project = db.query(Project).filter(Project.id == project_id, Project.client_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    milestone = Milestone(
        project_id=project.id,
        title=milestone_in.title,
        description=milestone_in.description,
        requirements_text=milestone_in.requirements_text,
        payment_amount=milestone_in.payment_amount,
        currency=milestone_in.currency,
        deadline=milestone_in.deadline,
        submission_status="pending",
        ai_verification_status="not_started",
        client_approval_status="pending_authorization"
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    log_audit(db, action="MILESTONE_CREATED", resource_type="Milestone", resource_id=milestone.id, user_id=current_user.id)
    return milestone

@router.get("/projects/{project_id}/milestones", response_model=List[MilestoneResponse])
def list_project_milestones(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Milestone).filter(Milestone.project_id == project_id).order_by(Milestone.created_at.asc()).all()

@router.get("/milestones/{milestone_id}", response_model=MilestoneResponse)
def get_milestone(
    milestone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return milestone

@router.post("/milestones/{milestone_id}/submit", response_model=SubmissionResponse)
async def submit_deliverable(
    milestone_id: str,
    notes: Optional[str] = Form(None),
    live_url: Optional[str] = Form(None),
    files: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_freelancer)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    # Increment submission version
    prev_count = db.query(MilestoneSubmission).filter(MilestoneSubmission.milestone_id == milestone_id).count()
    version = prev_count + 1

    submission = MilestoneSubmission(
        milestone_id=milestone.id,
        freelancer_id=current_user.id,
        live_url=live_url,
        notes=notes,
        version=version,
        status="submitted"
    )
    db.add(submission)
    db.flush()

    # Save uploaded files
    for file in files:
        if file.filename:
            path, filename, size, category = await storage_service.save_file(file, subfolder=f"sub_{submission.id}")
            sub_file = SubmissionFile(
                submission_id=submission.id,
                file_name=filename,
                file_path=path,
                file_size=size,
                file_type=file.content_type or "application/octet-stream",
                category=category
            )
            db.add(sub_file)

    milestone.submission_status = "submitted"
    milestone.ai_verification_status = "processing"
    milestone.client_approval_status = "in_review"

    db.commit()
    db.refresh(submission)

    log_audit(db, action="DELIVERABLE_SUBMITTED", resource_type="MilestoneSubmission", resource_id=submission.id, user_id=current_user.id)

    # Notify client
    create_notification(
        db,
        user_id=milestone.project.client_id,
        title="Deliverable Submitted",
        message=f"Freelancer submitted deliverables for milestone: {milestone.title}",
        notif_type="deliverable_submitted",
        related_id=milestone.id
    )

    return submission

@router.post("/milestones/{milestone_id}/verify", response_model=VerificationReportResponse)
async def verify_milestone_deliverable(
    milestone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers AI Verification Engine on latest deliverable submission.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    latest_submission = (
        db.query(MilestoneSubmission)
        .filter(MilestoneSubmission.milestone_id == milestone_id)
        .order_by(MilestoneSubmission.created_at.desc())
        .first()
    )
    if not latest_submission:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No submission found to verify")

    project = milestone.project
    project_reqs = [
        {
            "title": r.title,
            "description": r.description,
            "category": r.category,
            "weight": float(r.weight),
            "is_mandatory": r.is_mandatory
        }
        for r in project.requirements
    ]

    uploaded_files_data = [
        {"name": f.file_name, "path": f.file_path, "category": f.category}
        for f in latest_submission.files
    ]

    # Run AI verification
    ai_output: VerificationEngineOutput = await ai_verification_engine.verify_submission(
        project_title=project.title,
        project_requirements=project_reqs,
        milestone_title=milestone.title,
        milestone_requirements_text=milestone.requirements_text,
        submission_notes=latest_submission.notes,
        live_url=latest_submission.live_url,
        uploaded_files=uploaded_files_data
    )

    # Store verification report
    report = VerificationReport(
        milestone_id=milestone.id,
        submission_id=latest_submission.id,
        overall_score=Decimal(str(ai_output.overall_score)),
        summary=ai_output.summary,
        requires_human_review=ai_output.requires_human_review,
        raw_response=json.dumps(ai_output.model_dump())
    )
    db.add(report)
    db.flush()

    # Store criteria
    for item in ai_output.criteria:
        crit = VerificationCriteria(
            report_id=report.id,
            requirement=item.requirement,
            status=item.status,
            confidence=Decimal(str(round(item.confidence, 3))),
            evidence_references=json.dumps(item.evidence),
            explanation=item.explanation,
            weight=Decimal(str(item.weight or 1.0))
        )
        db.add(crit)

    milestone.ai_verification_status = "flagged_human_review" if ai_output.requires_human_review else "verified"
    db.commit()
    db.refresh(report)

    log_audit(db, action="AI_VERIFICATION_COMPLETED", resource_type="VerificationReport", resource_id=report.id, user_id=current_user.id)

    # Notify both parties
    create_notification(
        db,
        user_id=project.client_id,
        title="AI Verification Complete",
        message=f"AI Report ready for '{milestone.title}'. Score: {ai_output.overall_score}/100.",
        notif_type="verification_complete",
        related_id=milestone.id
    )
    create_notification(
        db,
        user_id=latest_submission.freelancer_id,
        title="AI Verification Complete",
        message=f"AI verified your submission for '{milestone.title}'. Score: {ai_output.overall_score}/100.",
        notif_type="verification_complete",
        related_id=milestone.id
    )

    res = VerificationReportResponse.model_validate(report)
    res.details = ai_output
    return res

@router.get("/milestones/{milestone_id}/report", response_model=VerificationReportResponse)
def get_verification_report(
    milestone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = (
        db.query(VerificationReport)
        .filter(VerificationReport.milestone_id == milestone_id)
        .order_by(VerificationReport.created_at.desc())
        .first()
    )
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification report not yet generated")

    res = VerificationReportResponse.model_validate(report)
    if report.raw_response:
        try:
            res.details = VerificationEngineOutput(**json.loads(report.raw_response))
        except Exception:
            pass
    return res

@router.post("/milestones/{milestone_id}/approve")
async def approve_and_capture_milestone(
    milestone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    """
    Client explicitly approves deliverable after inspecting AI report.
    Triggers payment capture if an authorization ID exists.
    """
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    if milestone.project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    milestone.client_approval_status = "approved"

    # Capture PayPal authorization if exists
    capture_result = None
    if milestone.paypal_authorization_id:
        try:
            capture_res = await paypal_service.capture_authorization(
                authorization_id=milestone.paypal_authorization_id,
                amount=milestone.payment_amount,
                currency=milestone.currency,
                note=f"Approved milestone: {milestone.title}"
            )
            milestone.paypal_capture_id = capture_res.get("capture_id")
            capture_result = capture_res

            # Update Payment record
            payment = db.query(Payment).filter(Payment.milestone_id == milestone.id).first()
            if payment:
                payment.status = "captured"
                payment.paypal_capture_id = milestone.paypal_capture_id
                db.add(
                    PaymentEvent(
                        payment_id=payment.id,
                        event_type="PAYMENT_CAPTURED",
                        paypal_event_id=milestone.paypal_capture_id,
                        payload=json.dumps(capture_res)
                    )
                )
        except Exception as e:
            logger.error(f"Error capturing PayPal payment: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"PayPal capture failed: {str(e)}")

    db.commit()
    db.refresh(milestone)

    log_audit(db, action="MILESTONE_APPROVED_PAYMENT_CAPTURED", resource_type="Milestone", resource_id=milestone.id, user_id=current_user.id)

    # Notify freelancer
    if milestone.project.freelancer_id:
        create_notification(
            db,
            user_id=milestone.project.freelancer_id,
            title="Milestone Approved & Paid!",
            message=f"Client approved milestone '{milestone.title}'. Payment of ${milestone.payment_amount} captured.",
            notif_type="payment_captured",
            related_id=milestone.id
        )

    return {
        "status": "success",
        "message": "Milestone approved and payment successfully captured",
        "milestone_id": milestone.id,
        "paypal_capture_id": milestone.paypal_capture_id,
        "capture_details": capture_result
    }

@router.post("/milestones/{milestone_id}/request-revision")
def request_revision(
    milestone_id: str,
    feedback: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone or milestone.project.client_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    milestone.submission_status = "resubmission_requested"
    milestone.client_approval_status = "revision_requested"
    db.commit()

    log_audit(db, action="REVISION_REQUESTED", resource_type="Milestone", resource_id=milestone.id, user_id=current_user.id, details={"feedback": feedback})

    if milestone.project.freelancer_id:
        create_notification(
            db,
            user_id=milestone.project.freelancer_id,
            title="Revision Requested",
            message=f"Client requested a revision on '{milestone.title}': {feedback[:100]}",
            notif_type="revision_requested",
            related_id=milestone.id
        )

    return {"status": "success", "message": "Revision requested", "milestone_id": milestone.id}
