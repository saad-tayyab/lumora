---
id: CON-AUTH-014
name: AuthenticateUser
context: BC-AUTH
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - command
  - security
---

# AuthenticateUser

## Definition

A command representing the intent to authenticate a user via credentials (password, OAuth, or MFA). Validates credentials, checks account status, and creates a session on success.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| email | string(255) | yes | User's email address |
| password | string(255) | no | Password (required for password auth) |
| mfa_code | string(10) | no | MFA verification code (required if MFA enabled) |
| oauth_token | string(500) | no | OAuth token (required for OAuth auth) |
| ip_address | string(45) | yes | Client IP address |
| user_agent | string(500) | yes | Client user agent |
| timestamp | timestamp | yes | When the command was issued |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | authenticates | 1:1 | Command authenticates a User |
| CON-AUTH-004 (Session) | creates | 0:1 | Command creates a session on success |
| CON-AUTH-010 (UserAuthenticated) | emits | 0:1 | Emitted on successful authentication |
| CON-AUTH-012 (LoginAttempted) | emits | 1:1 | Always emitted for every attempt |

## Invariants

- Account must not be locked.
- Password must match the stored hash.
- MFA code must be valid if MFA is enabled.

## Business Rules

- Maximum 5 failed attempts before account lockout.
- Lockout duration is configurable.

## Events

- CON-AUTH-010 (UserAuthenticated)
- CON-AUTH-012 (LoginAttempted)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [PasswordPolicy](CON-AUTH-016.password-policy.md)
- [SessionTimeoutPolicy](CON-AUTH-017.session-timeout-policy.md)
