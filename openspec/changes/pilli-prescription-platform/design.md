## Context

**Pilli** implements PRD-RXGEN-001: a Next.js (App Router) prescription generator for physicians and medical staff, with Airtable-backed physician metadata, a local JSON Drug Master List, structured Signa inputs, and PDF output suitable for regulatory and clinical audit. The Philippines **DPA 2012** applies to personal data handling. Visual direction follows the user-provided **clinical portal mockups** (deep blue primary, orange for primary CTAs, light gray canvas, white cards, left sidebar + top app bar, rounded corners ~8px, subtle elevation, sans-serif typography, dashboard tables and widgets).

Current repository state for this change: capability specs are net-new; implementation will introduce routes, server integrations, and UI primitives rather than extending an existing in-repo prescription module.

## Goals / Non-Goals

**Goals:**

- Establish **server-only** access to Airtable for physician profiles and audit logs; expose safe DTOs to the client.
- Deliver **role-aware** flows: Physicians can finalize and sign; MedStaff can prepare drafts; Admin can review logs (and later user/DML management as scoped by follow-on work if not in initial slice).
- Implement **fast drug search** from bundled JSON with autocomplete suitable for large lists.
- Provide **structured Signa** controls (not free-text-only dosing), **quantity guardrails**, **multi-line items**, **brand vs generic** selection, and **remarks**.
- Generate **printable PDFs** with auto date, physician block (PTR, license as available), and **signature image** for physician issuance.
- Implement **custom modals** for errors and confirmations (no native browser dialogs for user-facing flows).
- Ship a **cohesive clinical UI shell** aligned to the mockups: marketing/landing patterns where needed, authenticated app layout with sidebar navigation, KPI-style summary cards on overview-style pages, and data-dense tables for logs.

**Non-Goals:**

- E-pharmacy fulfillment APIs, patient self-service portal, and **complex DDI** engines (beyond simple form-level checks explicitly called out in PRD as out of scope).
- Long-term storage of full patient demographics in Airtable **unless** the organization later adopts an explicit Patient Master base (default per PRD: minimize persistence of patient names).

## Decisions

1. **Auth: NextAuth.js (session-based)**  
   - *Rationale*: Matches PRD; mature App Router integration patterns.  
   - *Alternatives*: Clerk, Auth0 (adds cost/vendor lock-in for a DPA-sensitive deployment).

2. **Airtable access only from server**  
   - *Rationale*: Keeps API keys off the client; aligns with MedGrocer-style security expectations.  
   - *Pattern*: Next.js Route Handlers or Server Actions with a thin `createReadPhysicianProfile`-style service module and centralized retry/backoff respecting ~5 req/s.

3. **Drug data: static JSON in repo or `public/`**  
   - *Rationale*: PRD calls for high-speed search without DB round-trips.  
   - *Alternatives*: Edge KV or DB (adds latency/cost for v1).

4. **PDF: prefer `@react-pdf/renderer` or `jspdf`** (final library choice at implementation after spike on signature placement and font embedding)  
   - *Rationale*: PRD allows either; pick one stack-wide to reduce maintenance.

5. **Patient fields: session-scoped or draft record without pushing PII to audit log rows**  
   - *Rationale*: Honor PRD feedback on DPA; audit log stores transaction metadata (user id, timestamp, prescription id) and avoids patient name where not strictly required.

6. **UI: Tailwind design tokens** mapping to mockup palette (e.g. primary blue `#0033CC` or PRD-adjacent `#2C3E50` / `#3498DB` families—**single canonical palette** chosen at build time and documented in theme config)  
   - *Rationale*: Two mockup variants existed in references; implementation SHALL pick one token set and apply consistently.

7. **Logging**  
   - *Rationale*: PRD FR.10; use structured server logs for failures and explicit Airtable append (or dedicated table) on successful PDF generation.

## Risks / Trade-offs

- **[Risk] Airtable rate limits** → Mitigation: server-side caching of physician profile per session, debounced refetch, exponential backoff on 429.  
- **[Risk] Large JSON bundle size** → Mitigation: lazy load / code-split drug index, or pre-index at build time into a compact structure.  
- **[Risk] PDF fidelity vs browser preview drift** → Mitigation: single source of layout component or shared layout definition for preview and PDF where feasible.  
- **[Risk] DPA: accidental PII in logs** → Mitigation: redact patient fields from server logs; schema review before storing any patient identifier off-device.  
- **[Trade-off] Draft saving in Airtable vs local** → MedStaff drafts may use local storage first if legal prefers zero cloud PII; otherwise encrypted minimal fields in Airtable—decide in Open Questions if legal input pending.

## Migration Plan

1. Add environment variables and secrets for NextAuth and Airtable in deployment targets; document in `.env.example` (no real secrets committed).  
2. Ship behind feature flag or protected routes until smoke-tested: login → profile load → prescription → PDF → audit row.  
3. Rollback: disable prescription routes at edge/config; revoke Airtable token scope if compromised; PDF generation is stateless aside from logs.

## Open Questions

- **Canonical color tokens**: Confirm whether marketing prefers the royal blue (`#0033CC` + `#FF8A00`) set or the slate/blue (`#2C3E50` / `#3498DB` + `#E67E22`) set from the two reference boards—implementation should lock one.  
- **Airtable base schema**: Final table/field names for users, signatures, and audit log (implementation tasks can stub with documented placeholders).  
- **Draft persistence**: Confirm MedStaff drafts stored only client-side for v1 vs Airtable draft records with minimal PHI.
