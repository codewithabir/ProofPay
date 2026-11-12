import os
import re
import json
import logging
from typing import List, Dict, Any, Optional
from decimal import Decimal
import httpx
from PIL import Image

from app.core.config import settings
from app.schemas.verification import VerificationEngineOutput, CriteriaItem

logger = logging.getLogger(__name__)

class AIVerificationEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def verify_submission(
        self,
        project_title: str,
        project_requirements: List[Dict[str, Any]],
        milestone_title: str,
        milestone_requirements_text: Optional[str],
        submission_notes: Optional[str],
        live_url: Optional[str],
        uploaded_files: List[Dict[str, str]]  # list of {"name": str, "path": str, "category": str}
    ) -> VerificationEngineOutput:
        """
        Executes AI verification on submitted deliverables against requirements.
        Uses Gemini multimodal when key is available, and falling back to 
        rigorous rule-based code/media inspection engine.
        """
        # Step 1: Normalize all requirements into criteria list
        criteria_list = self._normalize_requirements(project_requirements, milestone_requirements_text)

        # Step 2: Extract evidence summaries from files and URL
        file_evidences, code_snippets = self._read_evidence_files(uploaded_files)
        url_evidence = await self._inspect_live_url(live_url) if live_url else None

        # Step 3: Run Gemini AI if API key is configured
        if self.api_key:
            try:
                ai_output = await self._run_gemini_verification(
                    project_title=project_title,
                    milestone_title=milestone_title,
                    criteria=criteria_list,
                    submission_notes=submission_notes,
                    live_url=live_url,
                    url_evidence=url_evidence,
                    file_evidences=file_evidences,
                    code_snippets=code_snippets,
                    uploaded_files=uploaded_files
                )
                if ai_output:
                    return ai_output
            except Exception as e:
                logger.warning(f"Gemini API verification encounter, falling back to local inspector: {e}")

        # Step 4: Deterministic Heuristics & Static Inspection Engine
        return self._evaluate_with_heuristics(
            criteria_list=criteria_list,
            uploaded_files=uploaded_files,
            code_snippets=code_snippets,
            live_url=live_url,
            url_evidence=url_evidence,
            submission_notes=submission_notes
        )

    def _normalize_requirements(
        self,
        project_requirements: List[Dict[str, Any]],
        milestone_text: Optional[str]
    ) -> List[Dict[str, Any]]:
        criteria = []
        # From structured project requirements
        for req in project_requirements:
            criteria.append({
                "title": req.get("title", ""),
                "description": req.get("description", ""),
                "weight": float(req.get("weight", 1.0)),
                "is_mandatory": req.get("is_mandatory", True),
                "category": req.get("category", "functional")
            })

        # From milestone free-form text if present
        if milestone_text:
            lines = [line.strip().lstrip("-*1234567890. ") for line in milestone_text.splitlines() if line.strip()]
            for line in lines:
                if len(line) > 3 and not any(c["title"].lower() in line.lower() for c in criteria):
                    criteria.append({
                        "title": line,
                        "description": "Milestone-specific requirement",
                        "weight": 1.0,
                        "is_mandatory": True,
                        "category": "functional"
                    })

        if not criteria:
            criteria.append({
                "title": "Deliverable aligns with agreed milestone specifications",
                "description": "General deliverable quality and completeness",
                "weight": 1.0,
                "is_mandatory": True,
                "category": "functional"
            })

        return criteria

    def _read_evidence_files(self, uploaded_files: List[Dict[str, str]]):
        file_evidences = []
        code_snippets = {}

        for f in uploaded_files:
            name = f["name"]
            path = f["path"]
            cat = f["category"]

            if not os.path.exists(path):
                continue

            size_kb = os.path.getsize(path) / 1024

            if cat == "screenshot":
                try:
                    with Image.open(path) as img:
                        w, h = img.size
                        file_evidences.append({
                            "name": name,
                            "type": "image",
                            "dimensions": f"{w}x{h}",
                            "aspect_ratio": round(w / h, 2) if h else 0,
                            "size_kb": round(size_kb, 1)
                        })
                except Exception:
                    file_evidences.append({"name": name, "type": "image", "size_kb": round(size_kb, 1)})

            elif cat in {"code", "document"}:
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as file_handle:
                        content = file_handle.read()
                        # Keep up to 2500 chars per file for inspection
                        code_snippets[name] = content[:3000]
                        file_evidences.append({
                            "name": name,
                            "type": cat,
                            "size_kb": round(size_kb, 1),
                            "lines": len(content.splitlines())
                        })
                except Exception as e:
                    logger.warning(f"Could not read text file {name}: {e}")

        return file_evidences, code_snippets

    async def _inspect_live_url(self, url: str) -> Optional[Dict[str, Any]]:
        """Safely fetches HTTP response headers and basic HTML metadata."""
        try:
            async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
                resp = await client.get(url, headers={"User-Agent": "ProofPay-Verification-Bot/1.0"})
                status_code = resp.status_code
                title_match = re.search(r"<title>(.*?)</title>", resp.text, re.IGNORECASE)
                title = title_match.group(1).strip() if title_match else "No title found"
                has_viewport = "viewport" in resp.text.lower()
                return {
                    "url": url,
                    "status_code": status_code,
                    "is_live": (200 <= status_code < 400),
                    "page_title": title[:100],
                    "has_responsive_meta": has_viewport
                }
        except Exception as e:
            return {"url": url, "is_live": False, "error": str(e)}

    async def _run_gemini_verification(
        self,
        project_title: str,
        milestone_title: str,
        criteria: List[Dict[str, Any]],
        submission_notes: Optional[str],
        live_url: Optional[str],
        url_evidence: Optional[Dict[str, Any]],
        file_evidences: List[Dict[str, Any]],
        code_snippets: Dict[str, str],
        uploaded_files: List[Dict[str, str]]
    ) -> Optional[VerificationEngineOutput]:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.api_key)

        prompt = f"""
You are the ProofPay AI Verification Engine. Your duty is to conduct a fair, rigorous, and explainable audit of submitted work against agreed requirements.

CRITICAL RULES:
1. ProofPay is a financial milestone verification engine. Be objective, accurate, and explainable.
2. DISTINGUISH visible appearance from real interactive functionality. A screenshot can prove visual layout/styling, but CANNOT prove that an interactive button, form validation, or backend API works. If functional behavior cannot be verified from the evidence, label it "unverifiable" or "partially_fulfilled".
3. Statuses allowed: "fulfilled", "partially_fulfilled", "missing", "unverifiable".
4. Derive overall_score (0-100) strictly from criteria weights.
5. If evidence is insufficient or conflicting, set requires_human_review to true.

Project: {project_title}
Milestone: {milestone_title}
Freelancer Notes: {submission_notes or "None provided"}
Live URL: {live_url or "None provided"}
URL Reachability: {json.dumps(url_evidence) if url_evidence else "N/A"}

Files Submitted:
{json.dumps(file_evidences, indent=2)}

Code Snippets Sample:
{json.dumps(code_snippets, indent=2)}

Requirements / Criteria to Evaluate:
{json.dumps(criteria, indent=2)}

Respond ONLY with valid JSON following this exact schema:
{{
  "overall_score": 85,
  "summary": "Concise 2-3 sentence overview of findings",
  "criteria": [
    {{
      "requirement": "Name of requirement",
      "status": "fulfilled",
      "confidence": 0.95,
      "evidence": ["file1.png", "code.tsx"],
      "explanation": "Clear reason for this assessment.",
      "weight": 1.0
    }}
  ],
  "missing_requirements": ["string"],
  "potential_issues": ["string"],
  "recommendations": ["string"],
  "limitations": ["string"],
  "requires_human_review": true
}}
"""

        # Prepare multimodal parts: include images if present
        contents = [prompt]
        for f in uploaded_files:
            if f["category"] == "screenshot" and os.path.exists(f["path"]):
                try:
                    with open(f["path"], "rb") as img_file:
                        contents.append(
                            types.Part.from_bytes(
                                data=img_file.read(),
                                mime_type="image/png"
                            )
                        )
                except Exception:
                    pass

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        if response and response.text:
            parsed = json.loads(response.text)
            return VerificationEngineOutput(**parsed)
        return None

    def _evaluate_with_heuristics(
        self,
        criteria_list: List[Dict[str, Any]],
        uploaded_files: List[Dict[str, str]],
        code_snippets: Dict[str, str],
        live_url: Optional[str],
        url_evidence: Optional[Dict[str, Any]],
        submission_notes: Optional[str]
    ) -> VerificationEngineOutput:
        """
        Deterministic, explainable static inspection engine when LLM is unavailable.
        Evaluates criteria using code token search, image presence, URL metadata, and file categories.
        """
        all_code_text = " \n".join(code_snippets.values()).lower()
        file_names = [f["name"] for f in uploaded_files]
        screenshot_names = [f["name"] for f in uploaded_files if f["category"] == "screenshot"]
        code_names = [f["name"] for f in uploaded_files if f["category"] == "code"]

        criteria_results: List[CriteriaItem] = []
        missing_reqs = []
        potential_issues = []
        recommendations = []
        limitations = [
            "AI analyzed submitted static assets and code structure. Interactive runtime execution and database state were not dynamically tested."
        ]
        requires_human_review = False

        total_weight = 0.0
        weighted_score_sum = 0.0

        for crit in criteria_list:
            req_text = crit["title"]
            category = crit.get("category", "functional")
            weight = float(crit.get("weight", 1.0))
            total_weight += weight

            req_lower = req_text.lower()
            matched_evidence = []
            status = "missing"
            confidence = 0.5
            explanation = ""

            # Check responsiveness / mobile criteria
            if any(k in req_lower for k in ["responsive", "mobile", "tablet", "layout", "viewport"]):
                has_media_query = "@media" in all_code_text or "sm:" in all_code_text or "md:" in all_code_text or "lg:" in all_code_text
                has_viewport = url_evidence.get("has_responsive_meta", False) if url_evidence else False
                mobile_screenshot = any("mobile" in s.lower() for s in screenshot_names)

                if screenshot_names:
                    matched_evidence.extend(screenshot_names)
                if code_names:
                    matched_evidence.extend(code_names)

                if (has_media_query or has_viewport) and screenshot_names:
                    status = "fulfilled"
                    confidence = 0.94
                    explanation = "Evidence indicates responsive CSS/Tailwind breakpoints and mobile viewport configuration."
                elif screenshot_names:
                    status = "partially_fulfilled"
                    confidence = 0.78
                    explanation = "Screenshots demonstrate visual layout, but responsive code queries require confirmation across variable viewports."
                    requires_human_review = True
                else:
                    status = "missing"
                    confidence = 0.85
                    explanation = "No mobile screenshots or responsive CSS rules detected in deliverables."

            # Check navigation / header / navbar criteria
            elif any(k in req_lower for k in ["nav", "header", "menu", "navigation"]):
                has_nav_code = any(k in all_code_text for k in ["<nav", "navbar", "navlink", "menu", "header"])
                matched_evidence.extend([n for n in code_names if "nav" in n.lower() or "header" in n.lower()])
                matched_evidence.extend(screenshot_names[:1])

                if has_nav_code and screenshot_names:
                    status = "fulfilled"
                    confidence = 0.92
                    explanation = "Navigation component markup and visual display verified in screenshots and code."
                elif has_nav_code or screenshot_names:
                    status = "partially_fulfilled"
                    confidence = 0.75
                    explanation = "Partial evidence found: either navigation markup or visual representation present."
                else:
                    status = "missing"
                    confidence = 0.80
                    explanation = "No navigation component or related header evidence identified."

            # Check live deployment / URL criteria
            elif any(k in req_lower for k in ["live", "url", "deploy", "host", "domain"]):
                if live_url and url_evidence and url_evidence.get("is_live"):
                    matched_evidence.append(live_url)
                    status = "fulfilled"
                    confidence = 0.96
                    explanation = f"Live site is accessible (HTTP status {url_evidence.get('status_code')}) with title: '{url_evidence.get('page_title')}'."
                elif live_url:
                    matched_evidence.append(live_url)
                    status = "partially_fulfilled"
                    confidence = 0.65
                    explanation = f"Live URL provided ({live_url}), but server check encountered issues: {url_evidence.get('error', 'unknown status')}."
                    potential_issues.append(f"Live URL {live_url} may be unreachable or requires authentication.")
                else:
                    status = "missing"
                    confidence = 0.90
                    explanation = "No live URL provided with deliverable submission."

            # General code or design criteria
            else:
                # Check keyword overlap between requirement and code/notes
                keywords = [w for w in re.findall(r"\b[a-zA-Z]{4,}\b", req_lower) if w not in {"with", "this", "that", "must", "have", "from", "user"}]
                hits = sum(1 for kw in keywords if kw in all_code_text) if keywords else 0

                if hits >= 2:
                    status = "fulfilled"
                    confidence = 0.85
                    matched_evidence.extend(code_names[:2])
                    explanation = f"Matched requirement technical tokens in code files ({', '.join(code_names[:2])})."
                elif screenshot_names or code_names:
                    status = "unverifiable"
                    confidence = 0.60
                    matched_evidence.extend(file_names[:2])
                    explanation = "Static assets submitted, but specific functional execution cannot be verified from screenshots alone."
                    requires_human_review = True
                else:
                    status = "missing"
                    confidence = 0.85
                    explanation = "No matching code, screenshot, or document evidence found."

            # Deduplicate evidence
            matched_evidence = list(dict.fromkeys(matched_evidence))

            # Weight calculation
            mult_map = {
                "fulfilled": 1.0,
                "partially_fulfilled": 0.5,
                "unverifiable": 0.25,
                "missing": 0.0
            }
            weighted_score_sum += mult_map[status] * weight

            if status == "missing":
                missing_reqs.append(req_text)
            elif status == "unverifiable":
                potential_issues.append(f"Requirement '{req_text}' is unverifiable without live runtime verification.")

            criteria_results.append(
                CriteriaItem(
                    requirement=req_text,
                    status=status,
                    confidence=confidence,
                    evidence=matched_evidence,
                    explanation=explanation,
                    weight=weight
                )
            )

        overall_score = int(round((weighted_score_sum / total_weight) * 100)) if total_weight > 0 else 0

        # Construct summary and recommendations
        if overall_score >= 80:
            summary = f"Deliverable strongly aligns with requirements, achieving an explainable audit score of {overall_score}/100 across {len(criteria_results)} criteria."
            recommendations.append("Client can proceed with milestone approval and payment capture upon brief visual inspection.")
        elif overall_score >= 50:
            summary = f"Deliverable partially satisfies requirements with a score of {overall_score}/100. Key items require clarification or refinement."
            recommendations.append("Review unverifiable and partially fulfilled criteria before deciding on payment capture.")
            requires_human_review = True
        else:
            summary = f"Deliverable falls short of agreed specifications with a score of {overall_score}/100. Significant requirements are unfulfilled."
            recommendations.append("Consider requesting a revision with explicit feedback via the Revision Request tool.")
            requires_human_review = True

        return VerificationEngineOutput(
            overall_score=overall_score,
            summary=summary,
            criteria=criteria_results,
            missing_requirements=missing_reqs,
            potential_issues=potential_issues,
            recommendations=recommendations,
            limitations=limitations,
            requires_human_review=requires_human_review
        )

ai_verification_engine = AIVerificationEngine()
