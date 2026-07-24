---
id: CON-AUTH-002
name: Role
context: BC-AUTH
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - authorization
  - rbac
---

# Role

## Definition

A named collection of permissions that can be assigned to users. Roles implement Role-Based Access Control (RBAC). Roles are additive only — assigning a role never revokes existing permissions (INV-AUTH-002).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(50) | yes | Role name (e.g., "Admin", "Accountant") |
| description | string(255) | no | Human-readable description |
| tenant_id | UUID v7 | yes | Tenant this role belongs to |
| is_system | boolean | yes | Whether this is a built-in system role |
| created_at | timestamp | yes | Creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |
| deleted_at | timestamp | no | Soft deletion timestamp (INV-AUTH-003) |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | belongs-to | M:N | Role is assigned to many users |
| CON-AUTH-003 (Permission) | has-many | M:N | Role contains multiple permissions |

## Invariants

- INV-AUTH-002: Roles are additive only; no role can revoke base permissions.
- INV-AUTH-003: Soft deletion is mandatory for user-facing entities.

## Business Rules

- System roles cannot be deleted or modified by users.
- Role names must be unique within a tenant.

## Events

- CON-AUTH-011 (RoleAssigned)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution — Authentication Invariants](../../constitution/DOMAIN.md#43-authentication-invariants)
