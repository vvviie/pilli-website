## 1. Project foundation

- [ ] 1.1 Confirm Next.js App Router and Tailwind baseline in the repo; add any missing root layout or `globals.css` hooks for design tokens.
- [ ] 1.2 Add `.env.example` entries for NextAuth, Airtable base IDs, and public app URL (no secrets).
- [ ] 1.3 Add dependencies: NextAuth.js, Airtable client (or REST helper), and chosen PDF stack (`@react-pdf/renderer` or `jspdf`) after a one-page spike decision recorded in code comments or ADR pointer in `design.md` if needed.

## 2. Design tokens and clinical shell

- [ ] 2.1 Define Tailwind theme extension (primary blue, accent orange, neutrals, radii ~8px, shadow tokens) per `clinical-portal-ui` spec; lock one palette from design Open Questions.
- [ ] 2.2 Implement authenticated `AppShell` with left sidebar, top bar, and main content area; add placeholder nav items (Overview, Create prescription, Logs).
- [ ] 2.3 Implement marketing landing route with hero, primary/secondary CTAs, feature grid, and footer CTA band per `clinical-portal-ui` spec.
- [ ] 2.4 Add shared `Modal` (or dialog) component and toast/banner pattern; ensure no `alert()`/`confirm()` in prescription flows.

## 3. Authentication and roles

- [ ] 3.1 Configure NextAuth with session strategy and role claim (Physician, MedStaff, Admin) sourced from user table or JWT callback.
- [ ] 3.2 Add middleware or layout guards for protected routes; redirect unauthenticated users to login.
- [ ] 3.3 Route MedStaff vs Physician vs Admin to allowed surfaces per `user-auth-and-roles` spec (stub Admin audit route early).

## 4. Airtable physician profile

- [ ] 4.1 Implement server-only module `readPhysicianProfileFromAirtable` (or equivalent) keyed by session email with retry/backoff for 429.
- [ ] 4.2 Expose a server action or route handler that returns a safe DTO (license, PTR, signature URL) to the client; cache per session where practical.
- [ ] 4.3 Map Airtable field names to DTO in one config file; document stub schema until final base is confirmed.

## 5. Drug library and Signa form

- [ ] 5.1 Add Drug Master List JSON (sample subset acceptable initially) and a typed loader; consider build-time index for search performance.
- [ ] 5.2 Build drug autocomplete combobox with selection from JSON only.
- [ ] 5.3 Build line-item model: dosage, frequency (dropdown), duration, route, quantity, brand/generic toggle, remarks; support add/remove multiple lines.
- [ ] 5.4 Enforce quantity ≥ 1 and required fields before preview/PDF; surface validation via modal or inline errors.

## 6. Patient demographics

- [ ] 6.1 Add patient name, age, sex fields to the prescription form with required validation before preview/PDF.
- [ ] 6.2 Ensure default audit payload omits patient full name per `patient-demographics-entry` spec unless policy changes.

## 7. Preview and PDF

- [ ] 7.1 Build on-screen preview composing patient block, physician block (from profile DTO), line items, remarks, and auto-filled current date.
- [ ] 7.2 Implement PDF generation matching preview content; download on success.
- [ ] 7.3 Fetch signature image server-side or via signed URL pattern; render on PDF when present; block or modal-clear error when signature missing per chosen policy.

## 8. Audit and drafts

- [ ] 8.1 On successful PDF generation, write audit row via server (user id, timestamp, transaction id) without patient PII by default.
- [ ] 8.2 Implement MedStaff draft save/resume using chosen persistence (localStorage v1 or Airtable) per design Open Questions; wire Physician approval path if drafts enabled.
- [ ] 8.3 Add Admin view listing audit entries (read-only table) with filters stub.

## 9. Quality and compliance

- [ ] 9.1 Add structured server logging for Airtable/PDF failures without logging patient fields.
- [ ] 9.2 Smoke-test full happy path: login → profile load → drug selection → preview → PDF → audit row.
- [ ] 9.3 Document rate-limit and DPA notes for operators in a short internal comment block or existing README section the team already uses (no new markdown file unless the repo already documents features that way).
