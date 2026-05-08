## ADDED Requirements

### Requirement: JSON-backed drug search

The system SHALL provide autocomplete search against a local Drug Master List represented as JSON so users can select a medication without manual free-text-only entry of drug names.

#### Scenario: User finds a drug

- **WHEN** the user types a partial drug name in the drug search control
- **THEN** the system SHALL display matching suggestions from the JSON list and SHALL set the selected drug when the user confirms a suggestion

### Requirement: Structured Signa builder

The system SHALL provide structured controls for Signa fields including dosage, frequency (including dropdown-based frequency selection), duration, and route where applicable, instead of relying solely on unstructured text for these elements.

#### Scenario: Frequency selection

- **WHEN** the user opens the frequency control
- **THEN** the system SHALL present predefined frequency options via a dropdown or equivalent structured control

### Requirement: Quantity validation

The system SHALL prevent issuance when any line item quantity is below one.

#### Scenario: Invalid quantity blocked

- **WHEN** the user attempts to finalize or generate a PDF with quantity less than one on any line
- **THEN** the system SHALL block the action and SHALL show a clear validation message using a custom modal or inline validation (not a native browser alert)

### Requirement: Brand and generic naming

The system SHALL allow the physician to indicate brand versus generic naming preference for the prescription line item in accordance with PRD FR.07.

#### Scenario: Toggle brand or generic

- **WHEN** the user sets the brand/generic control on a line item
- **THEN** the preview and generated PDF SHALL reflect the selected naming mode for that line item

### Requirement: Multiple drugs per prescription

The system SHALL support adding more than one medication line item to a single prescription before preview and PDF generation.

#### Scenario: Add second line item

- **WHEN** the user adds an additional drug line and completes required Signa fields
- **THEN** the preview and PDF SHALL include all valid line items in order

### Requirement: Remarks field

The system SHALL provide a free-text remarks section for prescriber notes separate from structured Signa fields.

#### Scenario: Remarks appear on output

- **WHEN** the user enters remarks and generates a PDF
- **THEN** the remarks SHALL appear in the formatted document in the designated section
