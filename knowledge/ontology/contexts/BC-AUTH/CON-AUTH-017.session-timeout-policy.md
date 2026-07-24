---
id: CON-AUTH-017
name: SessionTimeoutPolicy
context: BC-AUTH
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - policy
  - security
---

# SessionTimeoutPolicy

## Definition

A business policy defining the rules for session expiration and timeout behavior. Enforced by the session management system to ensure security and resource cleanup.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| idle_timeout_minutes | integer | yes | Minutes of inactivity before session expires (default: 30) |
| absolute_timeout_hours | integer | yes | Maximum session duration regardless of activity (default: 24) |
| max_concurrent_sessions | integer | yes | Maximum concurrent sessions per user (default: 5) |
| revoke_on_password_change | boolean | yes | Whether to revoke all sessions on password change |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-004 (Session) | enforces | 1:N | Policy is enforced on all sessions |

## Invariants

- Sessions must be expired when idle timeout or absolute timeout is reached.
- Concurrent session limit must not be exceeded.

## Business Rules

- Timeout values are configurable per tenant.
- Admin users may have shorter timeout requirements.
- Session cleanup runs periodically to remove expired sessions.

## Events

- None (policy enforces rules, does not produce events)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Session](CON-AUTH-004.session.md)
