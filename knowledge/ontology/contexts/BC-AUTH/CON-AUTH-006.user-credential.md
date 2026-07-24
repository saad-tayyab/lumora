---
id: CON-AUTH-006
name: UserCredential
context: BC-AUTH
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - credentials
  - security
---

# UserCredential

## Definition

An entity storing the authentication credentials for a user, including password hashes, password history, and account lockout state. Credentials are isolated from the User aggregate to enforce security boundaries.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| user_id | UUID v7 | yes | The user this credential belongs to |
| password_hash | string(255) | yes | Bcrypt/argon2 password hash |
| password_salt | string(255) | yes | Password salt |
| failed_attempts | integer | yes | Number of consecutive failed login attempts |
| locked_until | timestamp | no | Account lockout expiration |
| last_password_change | timestamp | yes | When password was last changed |
| created_at | timestamp | yes | Credential creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | belongs-to | 1:1 | Each user has exactly one credential record |

## Invariants

- Password hashes must never be stored in plain text.
- Failed attempt counter must be reset on successful authentication.

## Business Rules

- Accounts lock after configurable number of failed attempts.
- Password must comply with PasswordPolicy (CON-AUTH-016).

## Events

- None

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [PasswordPolicy](CON-AUTH-016.password-policy.md)
