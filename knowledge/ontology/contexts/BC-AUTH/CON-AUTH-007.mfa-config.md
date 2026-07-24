---
id: CON-AUTH-007
name: MFAConfig
context: BC-AUTH
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - mfa
  - security
---

# MFAConfig

## Definition

An immutable value object representing the multi-factor authentication configuration for a user. Stores the MFA method, secret key, and verification state.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | UUID v7 | yes | The user this config belongs to |
| method | enum | yes | totp, sms, email |
| secret | string(255) | yes | Encrypted TOTP secret or phone number |
| verified | boolean | yes | Whether MFA has been verified |
| backup_codes | string[] | no | Encrypted backup recovery codes |
| created_at | timestamp | yes | Configuration creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | belongs-to | 1:1 | Each user has at most one MFA config |

## Invariants

- MFA secret must be encrypted at rest.
- Backup codes must be one-time use only.

## Business Rules

- MFA is optional but recommended for all users.
- Admin users should be required to enable MFA.

## Events

- None (value objects do not produce events)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
