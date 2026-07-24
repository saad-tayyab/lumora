---
id: CON-AUTH-011
name: RoleAssigned
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
  - authorization
---

# RoleAssigned

## Definition

A domain event emitted when a role is assigned to a user. This is an additive operation only — roles are never revoked via this event (INV-AUTH-002).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| user_id | UUID v7 | yes | ID of the user receiving the role |
| role_id | UUID v7 | yes | ID of the assigned role |
| assigned_by | UUID v7 | yes | ID of the user who assigned the role |
| timestamp | timestamp | yes | When the assignment occurred |
| correlation_id | UUID v7 | no | Correlation ID for tracing |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | triggers | 1:1 | Event affects a user |
| CON-AUTH-002 (Role) | references | 1:1 | Event references a role |

## Invariants

- INV-AUTH-002: Roles are additive only; no role can revoke base permissions.

## Business Rules

- Role assignments are logged in the audit trail.
- Only users with admin privileges can assign roles.

## Events

- This is itself an event.

## References

- [Domain Constitution — Authentication Invariants](../../constitution/DOMAIN.md#43-authentication-invariants)
