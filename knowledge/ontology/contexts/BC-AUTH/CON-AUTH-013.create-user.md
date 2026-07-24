---
id: CON-AUTH-013
name: CreateUser
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
  - user-lifecycle
---

# CreateUser

## Definition

A command representing the intent to create a new user account. Validates input against business rules, creates the User aggregate, and emits the UserCreated event.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| email | string(255) | yes | User's email address |
| name | string(100) | yes | User's display name |
| username | string(50) | yes | Desired username |
| password | string(255) | yes | Initial password (will be hashed) |
| tenant_id | UUID v7 | yes | Tenant the user belongs to |
| created_by | UUID v7 | yes | ID of the user creating this account |
| timestamp | timestamp | yes | When the command was issued |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | creates | 1:1 | Command creates a User |
| CON-AUTH-009 (UserCreated) | emits | 1:1 | Command emits this event on success |

## Invariants

- Email must be unique within the tenant.
- Username must be unique within the tenant.
- Password must comply with PasswordPolicy (CON-AUTH-016).

## Business Rules

- Only users with admin privileges can create new accounts.
- Created users start in "inactive" status until email is verified.

## Events

- CON-AUTH-009 (UserCreated)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [PasswordPolicy](CON-AUTH-016.password-policy.md)
