## ADDED Requirements

### Requirement: Document preview

The system SHALL render a formatted on-screen preview of the prescription that includes physician details sourced from profile sync, patient demographics, structured Signa line items, remarks, and the issuance date.

#### Scenario: Preview updates with edits

- **WHEN** the user edits drug lines, Signa fields, or remarks
- **THEN** the preview SHALL update to reflect the latest valid state prior to PDF generation

### Requirement: PDF download

The system SHALL generate a downloadable PDF file representing the prescription using a supported library (react-pdf or jspdf) consistent with the technical design decision.

#### Scenario: Successful download

- **WHEN** the user invokes Generate PDF with a valid prescription state
- **THEN** the system SHALL produce a PDF file download and SHALL include all required prescription content fields

### Requirement: Auto-filled issuance date

The system SHALL automatically include the current calendar date on the prescription document without requiring manual date entry for standard flows.

#### Scenario: Date present on PDF

- **WHEN** the PDF is generated on a given calendar day
- **THEN** the document SHALL display that day’s date in the prescribed date field

### Requirement: Digital signature image on PDF

The system SHALL append the physician’s signature image to the PDF when a Physician finalizes issuance and a signature URL is present in the physician profile.

#### Scenario: Signature applied

- **WHEN** a Physician generates a PDF and the profile contains a valid signature image reference
- **THEN** the rendered PDF SHALL include the signature image in the designated signature area

#### Scenario: Missing signature handling

- **WHEN** a Physician attempts issuance without a configured signature asset
- **THEN** the system SHALL block final issuance or SHALL show an explicit error via custom modal per product policy chosen at implementation (consistent with safe prescribing practice)
