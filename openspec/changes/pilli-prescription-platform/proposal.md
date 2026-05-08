## Why

Manual prescription writing causes legibility problems, weak audit trails, and slower consultations. **Pilli** (this site) will implement the prescription generator described in PRD-RXGEN-001: a secure Next.js web app aligned with DPA 2012 (Philippines), with structured clinical inputs and traceable PDF output. The change is needed now to replace ad hoc flows with a single, reviewable path from login through signed PDF export.

## What Changes

- Introduce secure session-based authentication for Physicians, MedStaff, and Admin (NextAuth.js), with role-aware navigation after login.
- Add physician profile retrieval from Airtable (license, PTR, signature URL) with awareness of API rate limits and latency risks.
- Implement a searchable local JSON Drug Master List with autocomplete and a structured Signa builder (dosage, frequency, duration, route as applicable), including quantity validation (block when quantity is below 1), brand/generic preference, multiple line items per prescription, and optional remarks.
- Capture patient demographics (name, age, sex) in the prescription flow; default stance is in-memory / minimal persistence unless a dedicated Patient Master base is adopted later (per PRD DPA guidance).
- Provide document preview and PDF download (react-pdf or jspdf) with auto-filled date, physician details, and appended digital signature image for physicians.
- Log successful PDF generations to Airtable for audit; support MedStaff draft saving for later physician approval (lower priority in PRD but in scope).
- Replace browser `alert`/`confirm` with custom modals for errors and confirmations.
- Apply a clinical portal visual system inspired by the provided mockups: deep primary blue, orange primary actions, light gray workspace backgrounds, card-based layouts, left sidebar + top bar on app surfaces, rounded cards, subtle shadows, and high-contrast typography for medical readability.

Explicitly **not** in scope for this change: direct e-pharmacy APIs, patient-facing portal, and complex drug–drug interaction engines (basic validation only if already trivially available from form rules).

## Capabilities

### New Capabilities

- `user-auth-and-roles`: Session-based login (NextAuth.js), role detection (Physician, MedStaff, Admin), and route protection so prescriptions are attributed to the signed-in user.
- `physician-profile-airtable`: Server-side fetch of physician credentials and signature metadata from Airtable keyed by email, with resilience for rate limits (~5 req/s) and latency.
- `drug-library-and-signa`: Local JSON drug search/autocomplete, structured Signa controls (including frequency dropdowns), quantity rules, brand/generic toggle, multi-line prescriptions, and remarks.
- `patient-demographics-entry`: Form capture for patient name, age, and sex aligned to PRD FR.09 and DPA minimization guidance.
- `pdf-preview-and-export`: Formatted preview, PDF generation with current date auto-fill, and digital signature image on the document for physician issuance.
- `audit-draft-workflow`: Transaction logging of generated PDFs to Airtable for admins; optional draft persistence for MedStaff pending physician approval.
- `clinical-portal-ui`: Application shell, landing/marketing hero patterns, dashboard-style overview where useful, design tokens (blues, orange accent, neutrals), cards, tables, sidebars, and accessible high-contrast UI—visually aligned to the clinical portal reference mockups while functional requirements trace to PRD-RXGEN-001 and branding in the product is **Pilli**.

### Modified Capabilities

- None (no existing capability specs under `openspec/specs/`).

## Impact

- **Frontend**: Next.js App Router pages and components; Tailwind CSS for layout and tokens; new routes for login, prescription creation, preview, and admin-oriented log views as scoped by tasks.
- **Backend / data**: Next.js API routes or server actions for Airtable access (must remain server-side; no secrets in client bundles); static or bundled JSON for the Drug Master List.
- **Auth**: NextAuth configuration, session callbacks, and environment variables for providers and secrets.
- **Documents**: PDF library dependency (react-pdf or jspdf) and asset pipeline for signature images.
- **Compliance / privacy**: Logging and storage choices must respect PRD guidance on patient identifiers in Airtable.
- **Dependencies**: New npm packages for auth, PDF, and Airtable client; environment configuration for deployment targets.
