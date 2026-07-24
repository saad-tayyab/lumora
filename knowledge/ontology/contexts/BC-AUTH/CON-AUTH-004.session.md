---
id: CON-AUTH-004
name: Session
context: BC-AUTH
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - session
  - security
---

# Session

## Definition

A time-bound context representing an authenticated user's interaction with the system. Sessions track active logins, device information, and expiration to enforce security policies.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique session identifier |
| user_id | UUID v7 | yes | The user this session belongs to |
| token | string(255) | yes | Session token (hashed) |
| ip_address | string(45) | yes | Client IP address |
| user_agent | string(500) | yes | Client user agent string |
| expires_at | timestamp | yes | Session expiration timestamp |
| created_at | timestamp | yes | Session creation timestamp |
| last_active_at | timestamp | yes | Last activity timestamp |
| revoked_at | timestamp | no | When session was revoked |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | belongs-to | N:1 | Session belongs to one user |

## Invariants

- Sessions must expire after the configured timeout period (CON-AUTH-017).
- Revoked sessions cannot be reactivated.

## Business Rules

- Maximum concurrent sessions per user is configurable.
- Sessions are automatically cleaned up after expiration.

## Events

- None

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [SessionTimeoutPolicy](CON-AUTH-017.session-timeout-policy.md)
