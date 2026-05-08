## ADDED Requirements

### Requirement: Patient demographic capture

The system SHALL capture patient name, age, and sex as part of the prescription preparation flow for MedStaff and Physician users.

#### Scenario: Required fields before PDF

- **WHEN** the user attempts to preview or generate a PDF without required patient demographics
- **THEN** the system SHALL block progression and SHALL indicate which fields are missing using non-native UI feedback

### Requirement: Data minimization by default

The system SHALL default to avoiding permanent storage of patient names or full demographic payloads in Airtable unless an explicit Patient Master base and policy are adopted; patient data SHALL be available for in-session prescription generation and PDF composition.

#### Scenario: Audit log without patient name

- **WHEN** a PDF is successfully generated and an audit record is written
- **THEN** the default audit payload SHALL omit patient full name unless a later approved schema explicitly requires it
