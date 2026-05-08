## ADDED Requirements

### Requirement: Clinical visual system

The system SHALL present authenticated application surfaces using a clinical portal layout and visual language consistent with the approved reference mockups: card-based content, rounded corners (approximately eight to twelve pixels), subtle shadows, a persistent left sidebar for primary navigation, a top bar for secondary actions and account context, a light gray workspace background, white cards, a deep blue primary brand treatment, and orange reserved for primary call-to-action controls.

#### Scenario: Authenticated layout shell

- **WHEN** a user views any authenticated dashboard or prescription screen
- **THEN** the layout SHALL include the sidebar and top bar pattern and SHALL apply the shared spacing and elevation tokens

### Requirement: High-contrast readable typography

The system SHALL use sans-serif typography with sufficient contrast for clinical legibility on primary content, controls, and tables, following PRD UX guidance for medical accuracy.

#### Scenario: Table legibility

- **WHEN** prescription logs or data tables are displayed
- **THEN** text SHALL meet contrast expectations for body copy in the default theme and SHALL remain readable at standard desktop densities

### Requirement: Custom modal error handling

The system SHALL not use native browser `alert` or `confirm` dialogs for user-facing errors or confirmations in prescription flows; the system SHALL use custom modals or equivalent in-app components.

#### Scenario: API error surfaced

- **WHEN** a server request fails during prescription save or PDF generation
- **THEN** the user SHALL see a custom modal or inline banner with an actionable message

### Requirement: Marketing landing patterns

The system SHALL provide a public landing or entry experience that supports hero messaging, primary and secondary calls to action, feature grid sections, and a closing call-to-action region consistent with the reference marketing frame, using the same tokenized color system.

#### Scenario: Visitor sees hero and CTAs

- **WHEN** an unauthenticated visitor opens the marketing home route
- **THEN** the page SHALL present a hero headline, a primary orange CTA, a secondary outline CTA, and a feature grid section before authenticated areas
