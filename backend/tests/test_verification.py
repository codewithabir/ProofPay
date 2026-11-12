import pytest
import os
from app.services.ai_verifier import ai_verification_engine
from app.schemas.verification import VerificationEngineOutput

@pytest.mark.asyncio
async def test_ai_verification_engine_heuristic_evaluation():
    project_requirements = [
        {"title": "Responsive Navigation Header with Mobile Drawer", "weight": 1.0, "is_mandatory": True, "category": "ui_ux"},
        {"title": "Interactive Pricing Table with Monthly / Annual Toggle", "weight": 1.0, "is_mandatory": True, "category": "functional"},
        {"title": "Live Deployed URL", "weight": 1.0, "is_mandatory": True, "category": "performance"}
    ]

    sample_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo", "sample_submission"))
    desktop_img = os.path.join(sample_dir, "screenshot_desktop_hero.png")
    mobile_img = os.path.join(sample_dir, "screenshot_mobile_drawer.png")
    code_file = os.path.join(sample_dir, "Navbar.tsx")
    html_file = os.path.join(sample_dir, "index.html")

    uploaded_files = [
        {"name": "screenshot_desktop_hero.png", "path": desktop_img, "category": "screenshot"},
        {"name": "screenshot_mobile_drawer.png", "path": mobile_img, "category": "screenshot"},
        {"name": "Navbar.tsx", "path": code_file, "category": "code"},
        {"name": "index.html", "path": html_file, "category": "code"},
    ]

    result: VerificationEngineOutput = await ai_verification_engine.verify_submission(
        project_title="SaaS Analytics Marketing Website",
        project_requirements=project_requirements,
        milestone_title="Landing Page & Responsive Navigation",
        milestone_requirements_text="- Responsive hero section\n- Sticky navbar with mobile hamburger menu",
        submission_notes="Implemented responsive navbar in React with Tailwind CSS and mobile drawer.",
        live_url=None,
        uploaded_files=uploaded_files
    )

    assert isinstance(result, VerificationEngineOutput)
    assert 0 <= result.overall_score <= 100
    assert len(result.criteria) >= 3
    # Criteria statuses must be one of the four allowed types
    valid_statuses = {"fulfilled", "partially_fulfilled", "missing", "unverifiable"}
    for c in result.criteria:
        assert c.status in valid_statuses
        assert 0.0 <= c.confidence <= 1.0
        assert len(c.explanation) > 0

    # Ensure limitations note that visual screenshots cannot verify all runtime functionality
    assert len(result.limitations) > 0
