---
id: CON-AUTH-015
name: AssignRole
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
  - authorization
---

# AssignRole

## Definition

A command representing the intent to assign a role to a user. This is an additive operation only — roles cannot be revoked via this command (INV-AUTH-002).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| user_id | UUID v7 | yes | ID of the user receiving the role |
| role_id | UUID v7 | yes | ID of the role to assign |
| assigned_by | UUID v7 | yes | ID of the user performing the assignment |
| timestamp | timestamp | yes | When the command was issued |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | modifies | 1:1 | Command modifies a User's roles |
| CON-AUTH-002 (Role) | references | 1:1 | Command references a Role |
| CON-AUTH-011 (RoleAssigned) | emits | 1:1 | Command emits this event on success |

## Invariants

- INV-AUTH-002: Roles are additive only; no role can revoke base permissions.
- The assigning user must have admin privileges.
- The target role must exist and not be soft-deleted.

## Business Rules

- Role assignments are logged in the audit trail.
- Duplicate role assignments are ignored (idempotent).

## Events

- CON-AUTH-011 (RoleAssigned)

## References

- [Domain Constitution — Authentication Invariants](../../constitution/DOMAIN.md#43-authentication-invariants)
