## ADDED Requirements

### Requirement: Session-based authentication

The system SHALL provide session-based user authentication so that prescription actions are attributable to the signed-in user.

#### Scenario: Successful sign-in

- **WHEN** a user submits valid credentials at the login surface
- **THEN** the system SHALL establish an authenticated session and SHALL redirect the user to a role-appropriate home route

#### Scenario: Unauthenticated access blocked

- **WHEN** an unauthenticated user requests a protected prescription or profile route
- **THEN** the system SHALL deny access and SHALL redirect or prompt for authentication without exposing protected API payloads

### Requirement: Role-aware routing

The system SHALL distinguish at minimum the Physician, MedStaff, and Admin personas defined in the PRD and SHALL route authenticated users to flows consistent with their role.

#### Scenario: Physician path

- **WHEN** a user with the Physician role completes authentication
- **THEN** the system SHALL allow access to create and approve prescription flows that include PDF issuance with signature

#### Scenario: MedStaff path

- **WHEN** a user with the MedStaff role completes authentication
- **THEN** the system SHALL allow access to draft preparation flows and SHALL withhold physician-only finalization actions until a physician approves (when draft workflow is enabled)

### Requirement: Admin access to operational views

The system SHALL grant Admin users access to operational interfaces required to review audit logs of generated PDFs as specified in the audit capability.

#### Scenario: Admin opens audit view

- **WHEN** an authenticated Admin user opens the audit log interface
- **THEN** the system SHALL display audit entries permitted by policy and SHALL not require a Physician or MedStaff session
