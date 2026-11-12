# ProofPay: AI-Powered Milestone Payment Verification Platform

> **Tagline:** *Work Verified. Payments Deserved.*

ProofPay is a production-quality hackathon platform connecting clients and independent freelancers through transparent, AI-audited milestone payments.

Clients authorize milestone funds upfront using **PayPal Orders API v2** (`intent: AUTHORIZE`). Freelancers submit deliverable artifacts (screenshots, source code components, live URLs), which an **AI Verification Engine** evaluates against explicit criteria weights. The client inspects an explainable verification report before authorizing the final PayPal capture.

---

## Key Features

1. **Two-Phase PayPal Orders v2 Workflow**:
   - Clients authorize payments before work begins.
   - Funds are held securely on PayPal for up to 29 days without permanent escrow balance risks.
   - Captured only upon explicit client approval of the verified deliverable.
   - Full support for refunds, webhook signature verification, and idempotency protection.

2. **Multimodal AI Verification Engine**:
   - Ingests screenshots (via multimodal vision), source code files, and live website URLs.
   - Strict status classification: `fulfilled`, `partially_fulfilled`, `missing`, and `unverifiable`.
   - Distinguishes visual appearance from dynamic runtime execution to avoid false positives.
   - Computes weighted, explainable confidence scores.
   - Automatically flags criteria requiring human review.

3. **Neutral AI Dispute Assistant**:
   - Analyzes rejection and revision feedback against the original contract scope.
   - Identifies divergence and scope creep.
   - Proposes actionable revisions and recommended evidence without deciding winners.

4. **Fintech Design Identity**:
   - Deep Navy (`#101B33`), Secondary Blue (`#356AE6`), Accent Teal (`#18B6A4`), and Soft Off-White (`#F7F9FC`).
   - Clean, professional SaaS dashboard for both Clients and Freelancers.

---

## Technology Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy ORM, Pydantic v2, Alembic Migrations, JWT Auth, SQLite/PostgreSQL
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, TanStack Query, Lucide React, Recharts
- **Payment Gateway**: PayPal REST API (Orders API v2, Authorizations, Captures, Refunds, Webhooks)
- **AI Engine**: Google Gemini API (Multimodal Vision + Code Inspection) with robust local static evaluation fallback

---

## Folder Structure

```
ProofPay/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # REST API endpoints (auth, projects, milestones, payments, disputes, webhooks)
│   │   ├── core/           # Config, database engine, security JWT & password hashing
│   │   ├── models/         # 13 SQLAlchemy normalized tables
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # PayPal v2, AI Verifier, AI Dispute, Local Storage, Audit
│   │   ├── seed.py         # Seed script populating demo scenario & sample deliverables
│   │   └── main.py         # FastAPI application entry point
│   ├── alembic/            # Database schema migration versions
│   ├── tests/              # Backend test suite (pytest)
│   └── pyproject.toml      # Python dependencies (managed via uv)
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (ScoreGauge, CriteriaCard, PayPalAuthModal, DisputeModal)
│   │   ├── contexts/       # AuthContext with token & user state
│   │   ├── pages/          # Public, Client, and Freelancer dashboard pages
│   │   ├── services/       # API clients
│   │   └── types/          # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── demo/
│   ├── sample_submission/  # Generated demo deliverables (screenshots, React component, HTML)
│   └── demo_walkthrough.md # 3-minute hackathon presentation script
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Python 3.12+ (or `uv`)
- Node.js 20+ (with `npm`)

### 2. Backend Setup
```bash
cd backend

# Install dependencies with uv
uv sync

# Run database migrations
uv run alembic upgrade head

# Seed demo data and deliverables
uv run python -m app.seed

# Start backend server
uv run uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## Running Automated Tests

```bash
cd backend
uv run pytest -v
```

---

## 3-Minute Hackathon Demo

Use the pre-seeded accounts or 1-click login buttons on the sign-in page:

| Role | Email | Password |
|---|---|---|
| **Client** | `client@proofpay.io` | `Password123!` |
| **Freelancer** | `freelancer@proofpay.io` | `Password123!` |

See [`demo/demo_walkthrough.md`](file:///e:/ProofPay/demo/demo_walkthrough.md) for the complete step-by-step demonstration walkthrough.
