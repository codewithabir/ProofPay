# ProofPay: 3-Minute Hackathon Demonstration Script

Tagline: **Work Verified. Payments Deserved.**  
Platform: **ProofPay** (AI-Powered Milestone Payment Verification Platform)

---

## Prerequisites (Pre-seeded Accounts)
ProofPay comes pre-seeded with all required roles, project data, and sample deliverable assets:

- **Client Demo Account**: `client@proofpay.io` / `Password123!`
- **Freelancer Demo Account**: `freelancer@proofpay.io` / `Password123!`
- **Demo Project**: "Modern SaaS Analytics Marketing Website" ($300 total budget)
- **Demo Deliverable Files**: Available in `demo/sample_submission/`
  - `screenshot_desktop_hero.png`
  - `screenshot_mobile_drawer.png`
  - `Navbar.tsx`
  - `index.html`

---

## The 3-Minute Demo Flow

### Minute 0:00 - 0:45 | The Problem & Client Authorization
1. **Open Landing Page** (`http://localhost:5173`):
   - Highlight the value proposition: Upfront payment protection without escrow balance risks.
   - Click **Demo Client** or sign in as `client@proofpay.io`.
2. **Inspect Project**:
   - Navigate to **My Projects** -> Click **Modern SaaS Analytics Marketing Website**.
   - Show the 3 agreed measurable criteria:
     1. Responsive Hero & Navigation Header with Mobile Drawer Menu (UI/UX)
     2. Interactive Pricing Tier Toggle with Plan Cards (Functional)
     3. Live Demonstration URL with HTTPS Deployment (Performance)
3. **Execute PayPal Authorization**:
   - For Milestone 1 ($100.00), click **Authorize with PayPal**.
   - The modal initiates a PayPal Orders v2 request with `intent: AUTHORIZE`.
   - Click **Execute Order Authorization (Hold Funds)**.
   - Show that funds are safely authorized (holding up to 29 days) but **not captured yet**.

---

### Minute 0:45 - 1:45 | Freelancer Deliverable Submission & AI Audit
1. **Switch to Freelancer**:
   - Click **Switch to Freelancer** in the navbar (or sign in as `freelancer@proofpay.io`).
2. **Review Milestone**:
   - Notice the authorized status: *"PayPal Payment Authorized by Client"*.
   - Click **Submit Deliverable**.
3. **Upload Evidence**:
   - Click **Autofill Demo Notes & URL** (`https://proofpay-showcase.web.app`).
   - Drag & drop or select the sample deliverable files from `demo/sample_submission/`:
     - `screenshot_desktop_hero.png`
     - `screenshot_mobile_drawer.png`
     - `Navbar.tsx`
     - `index.html`
4. **Trigger AI Verification**:
   - Click **Submit & Run AI Verification**.
   - Watch the AI Verification Engine evaluate screenshots, component code, and URL metadata.
   - Freelancer is redirected to the **AI Feedback** page showing an objective score (94/100).

---

### Minute 1:45 - 2:30 | Client AI Report Inspection
1. **Switch back to Client**:
   - Click **Switch to Client**.
   - Observe the live in-app notification: *"AI Report ready for 'Milestone 1'. Score: 94/100."*
2. **Inspect AI Audit Report**:
   - Open the **Inspect AI Report** view.
   - Point out the **ScoreGauge** (94/100: Strong Alignment).
   - Review each criterion card:
     - *Responsive Navigation*: Status **Fulfilled** (96% confidence) with matched evidence badges (`screenshot_mobile_drawer.png`, `Navbar.tsx`).
     - *Pricing Calculator*: Status **Fulfilled** (92% confidence).
   - Highlight the **Human Review Notice**:
     - Explain why ProofPay is unique: it recognizes that static code and screenshots can verify visual layout, but dynamic backend transactions require client confirmation.

---

### Minute 2:30 - 3:00 | Payment Capture & Dispute Mediation
1. **Capture the Payment**:
   - In the Client Decision Hub, click **Approve & Capture PayPal Payment**.
   - The backend executes the PayPal Capture API (`POST /v2/payments/authorizations/{id}/capture`).
   - The transaction transitions to `CAPTURED`. Show the generated PayPal Capture ID.
2. **Dispute Assistant Preview (Optional)**:
   - Click **AI Dispute Assistant** to show how client revision requests are analyzed against the original scope to eliminate scope creep and prevent disputes.
3. **Audit History**:
   - Navigate to **Payment History** to view the full PayPal order, authorization, and capture audit trail.
