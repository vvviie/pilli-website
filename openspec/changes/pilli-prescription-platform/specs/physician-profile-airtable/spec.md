## ADDED Requirements

### Requirement: Server-side physician profile fetch

The system SHALL retrieve physician profile data—including license identifier, PTR, and signature image URL—from Airtable using a server-side integration keyed by the authenticated user’s email (or equivalent stable identifier).

#### Scenario: Profile available

- **WHEN** an authenticated Physician requests prescription preparation and a matching Airtable record exists
- **THEN** the system SHALL supply license, PTR, and signature URL fields to the prescription preview pipeline without exposing Airtable secrets to the client

#### Scenario: Profile temporarily unavailable

- **WHEN** Airtable responds with a transient error or rate limit
- **THEN** the system SHALL retry with backoff within safe limits and SHALL surface a user-visible error via a custom modal (not a native browser alert)

### Requirement: Rate-limit-aware access

The system SHALL implement Airtable access in a manner that respects documented API rate limits (approximately five requests per second) for profile reads.

#### Scenario: Burst of navigations

- **WHEN** the user navigates rapidly between views that trigger profile refresh
- **THEN** the system SHALL coalesce or cache requests so that sustained traffic does not exceed safe Airtable usage
