---
id: CON-AUTH-010
name: UserAuthenticated
context: BC-AUTH
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - event
  - security
---

# UserAuthenticated

## Definition

A domain event emitted when a user successfully authenticates. Includes session details and method used for authentication.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| user_id | UUID v7 | yes | ID of the authenticated user |
| session_id | UUID v7 | yes | ID of the created session |
| method | enum | yes | password, oauth, mfa |
| ip_address | string(45) | yes | Client IP address |
| user_agent | string(500) | yes | Client user agent |
| timestamp | timestamp | yes | When authentication occurred |
| correlation_id | UUID v7 | no | Correlation ID for tracing |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | triggers | 1:1 | Event is triggered by user authentication |
| CON-AUTH-004 (Session) | creates | 1:1 | Event results in a new session |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.

## Business Rules

- Failed authentication attempts must also produce events (LoginAttempted).
- Authentication events must be recorded in the audit log.

## Events

- This is itself an event.

## References

- [Domain Constitution — Event Catalog](../../constitution/DOMAIN.md#7-event-catalog)
