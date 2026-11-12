import json
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIDisputeAssistant:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def analyze_dispute(
        self,
        project_title: str,
        project_requirements: List[str],
        milestone_title: str,
        submission_notes: Optional[str],
        submitted_files: List[str],
        client_reason: str
    ) -> Dict[str, Any]:
        """
        Generates neutral mediation summary, itemizes points of contention,
        and produces constructive recommendations without declaring winners.
        """
        if self.api_key:
            try:
                result = await self._run_gemini_dispute_analysis(
                    project_title=project_title,
                    project_requirements=project_requirements,
                    milestone_title=milestone_title,
                    submission_notes=submission_notes,
                    submitted_files=submitted_files,
                    client_reason=client_reason
                )
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini dispute analysis failed, falling back: {e}")

        # Deterministic Neutral Heuristic Analysis
        return self._generate_heuristic_dispute_summary(
            project_requirements=project_requirements,
            milestone_title=milestone_title,
            client_reason=client_reason,
            submitted_files=submitted_files
        )

    async def _run_gemini_dispute_analysis(
        self,
        project_title: str,
        project_requirements: List[str],
        milestone_title: str,
        submission_notes: Optional[str],
        submitted_files: List[str],
        client_reason: str
    ) -> Optional[Dict[str, Any]]:
        from google import genai
        client = genai.Client(api_key=self.api_key)

        prompt = f"""
You are the ProofPay Neutral AI Dispute Assistant.
Your duty is to act as an objective, unbiased mediator between a client and a freelancer.
DO NOT decide who wins or makes financial judgments. Instead, objectively compare the client's rejection reason against the original agreed requirements and the evidence provided.

Project: {project_title}
Milestone: {milestone_title}
Agreed Requirements: {json.dumps(project_requirements)}
Freelancer Submission Notes: {submission_notes or "None"}
Files Submitted by Freelancer: {json.dumps(submitted_files)}
Client Rejection Reason: {client_reason}

Respond ONLY with valid JSON following this exact structure:
{{
  "ai_summary": "Neutral, balanced 2-3 sentence overview clarifying the crux of the disagreement.",
  "disagreements": [
    "Specific objective point of divergence between client expectation and submitted work"
  ],
  "recommended_evidence": [
    "Concrete additional proof or test that would clarify whether the requirement was satisfied"
  ],
  "suggested_revisions": [
    "Actionable, measurable technical adjustment for the freelancer to address the client's feedback within agreed scope"
  ]
}}
"""
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        if response and response.text:
            return json.loads(response.text)
        return None

    def _generate_heuristic_dispute_summary(
        self,
        project_requirements: List[str],
        milestone_title: str,
        client_reason: str,
        submitted_files: List[str]
    ) -> Dict[str, Any]:
        """Neutral, structured fallback dispute synthesis."""
        reason_lower = client_reason.lower()

        # Check for scope alignment
        matched_scope = any(
            any(word in reason_lower for word in req.lower().split() if len(word) > 4)
            for req in project_requirements
        )

        disagreements = []
        recommended_evidence = []
        suggested_revisions = []

        if "mobile" in reason_lower or "responsive" in reason_lower:
            disagreements.append("Client noted responsiveness or viewport layout issues on specific device screens.")
            recommended_evidence.append("Provide a short screen recording or screenshot of the layout under 375px (iPhone) and 768px (iPad) viewports.")
            suggested_revisions.append("Adjust CSS flexbox/grid wrapping rules and verify overflow behavior at smaller screen widths.")

        elif "function" in reason_lower or "work" in reason_lower or "click" in reason_lower:
            disagreements.append("Client reported that interactive components or state transitions did not behave as expected.")
            recommended_evidence.append("Provide a test video showing button clicks, form submissions, or network inspector payload.")
            suggested_revisions.append("Verify event listener bindings and add clear validation error states for user input.")

        else:
            disagreements.append(f"Client identified concerns regarding: '{client_reason[:120]}...'")
            recommended_evidence.append("Provide targeted demonstration or annotated screenshot showing the specific section in question.")
            suggested_revisions.append("Address the client's specific feedback item while adhering to the agreed milestone specifications.")

        if not matched_scope:
            disagreements.append("Note: The feedback may introduce considerations not explicitly detailed in the initial milestone requirements.")

        ai_summary = (
            f"The dispute regarding milestone '{milestone_title}' centers on differences in deliverable expectations. "
            f"The client highlights: '{client_reason[:140]}'. "
            f"The freelancer submitted {len(submitted_files)} assets. "
            "Both parties are encouraged to review the objective criteria and exchange the recommended supplemental evidence."
        )

        return {
            "ai_summary": ai_summary,
            "disagreements": disagreements,
            "recommended_evidence": recommended_evidence,
            "suggested_revisions": suggested_revisions
        }

ai_dispute_assistant = AIDisputeAssistant()
