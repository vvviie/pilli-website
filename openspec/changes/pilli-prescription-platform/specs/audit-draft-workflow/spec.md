## ADDED Requirements

### Requirement: Audit logging of PDF generation

The system SHALL record each successful PDF generation event in Airtable (or the configured audit store) with metadata sufficient for administrative review, including at minimum user identifier, timestamp, and a stable prescription or transaction identifier, without violating the patient minimization default.

#### Scenario: Successful generation logged

- **WHEN** a PDF download completes successfully
- **THEN** the system SHALL create an audit log entry via the server integration

#### Scenario: Failed generation not logged as success

- **WHEN** PDF generation fails
- **THEN** the system SHALL not write a success audit entry and SHALL record diagnostic information only in accordance with logging policy (no sensitive patient content in unstructured logs)

### Requirement: MedStaff draft saving

The system SHALL allow MedStaff users to save a draft prescription for later physician approval when the draft workflow is enabled.

#### Scenario: Save draft

- **WHEN** a MedStaff user saves a draft with partial or complete prescription data
- **THEN** the system SHALL persist the draft according to the chosen persistence strategy (client-held or Airtable-backed) and SHALL allow the user to resume the draft in a later session where persistence is used

### Requirement: Physician approval of drafts

When draft workflow is enabled, the system SHALL allow a Physician to open a MedStaff-prepared draft, review contents, and finalize issuance including PDF generation and audit logging.

#### Scenario: Approve draft to PDF

- **WHEN** a Physician approves a pending draft with valid data
- **THEN** the system SHALL generate the PDF with signature rules applied and SHALL write the audit log entry
