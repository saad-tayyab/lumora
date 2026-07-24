---
id: CON-AUTH-016
name: PasswordPolicy
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

# PasswordPolicy

## Definition

A business policy defining the rules and constraints for user passwords. Enforced during password creation and change operations to ensure adequate security.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| min_length | integer | yes | Minimum password length (default: 8) |
| max_length | integer | yes | Maximum password length (default: 128) |
| require_uppercase | boolean | yes | Require at least one uppercase letter |
| require_lowercase | boolean | yes | Require at least one lowercase letter |
| require_digit | boolean | yes | Require at least one digit |
| require_special | boolean | yes | Require at least one special character |
| max_age_days | integer | yes | Maximum password age in days (0 = no expiry) |
| history_count | integer | yes | Number of previous passwords to remember |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-006 (UserCredential) | enforces | 1:N | Policy is enforced on all credentials |

## Invariants

- Passwords must comply with this policy at creation and change time.
- Password history must be checked against the history_count.

## Business Rules

- Default policy is configurable per tenant.
- Admin users may have stricter policy requirements.

## Events

- None (policy enforces rules, does not produce events)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [UserCredential](CON-AUTH-006.user-credential.md)
