---
id: CON-AUTH-003
name: Permission
context: BC-AUTH
type: value_object
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

# Permission

## Definition

An immutable value object representing a specific action that can be performed on a resource. Permissions are grouped into roles and are the finest granularity of access control.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| resource | string(100) | yes | The resource type (e.g., "invoice", "journal_entry") |
| action | enum | yes | The action allowed (create, read, update, delete, approve) |
| scope | enum | yes | Access scope (own, tenant, all) |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-002 (Role) | belongs-to | M:N | Permission is contained in many roles |

## Invariants

- Permissions are immutable value objects — they cannot be modified after creation.
- Each permission uniquely identifies a resource-action-scope combination.

## Business Rules

- Permissions follow the principle of least privilege.
- Default scope is "own" unless explicitly elevated.

## Events

- None (value objects do not produce events)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
