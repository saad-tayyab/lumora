---
id: CON-AUTH-012
name: LoginAttempted
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

# LoginAttempted

## Definition

A domain event emitted for every login attempt, whether successful or failed. This event is used for security monitoring, brute-force detection, and audit logging.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| email | string(255) | yes | Email address attempted |
| success | boolean | yes | Whether the attempt succeeded |
| failure_reason | string(100) | no | Reason for failure (invalid_password, account_locked, mfa_required) |
| ip_address | string(45) | yes | Client IP address |
| user_agent | string(500) | yes | Client user agent |
| timestamp | timestamp | yes | When the attempt occurred |
| correlation_id | UUID v7 | no | Correlation ID for tracing |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | references | 0:1 | May reference a user if email exists |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.

## Business Rules

- Login attempts must be rate-limited.
- Repeated failures should trigger account lockout.

## Events

- This is itself an event.

## References

- [Domain Constitution — Authentication Invariants](../../constitution/DOMAIN.md#43-authentication-invariants)
