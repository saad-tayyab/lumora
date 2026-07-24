---
id: CON-AUTH-008
name: AuditLog
context: BC-AUTH
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - authentication
  - audit
  - compliance
---

# AuditLog

## Definition

An append-only entity recording every significant action performed in the system. AuditLog ensures INV-AUTH-001 (every action attributable to a user) and INV-FIN-003 (every financial transaction has an audit trail).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| user_id | UUID v7 | yes | User who performed the action (or system process ID) |
| action | string(100) | yes | Action performed (login, create, update, delete) |
| resource_type | string(100) | yes | Type of resource affected |
| resource_id | UUID v7 | no | ID of the affected resource |
| details | jsonb | no | Additional action details |
| ip_address | string(45) | yes | Client IP address |
| timestamp | timestamp | yes | When the action occurred |
| tenant_id | UUID v7 | yes | Tenant context |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AUTH-001 (User) | belongs-to | N:1 | Audit log entry belongs to a user |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- INV-FIN-003: Every financial transaction must have an audit trail.
- Audit logs are append-only — records must never be modified or deleted.

## Business Rules

- Audit logs must be retained for a minimum of 7 years.
- Audit logs must include the user ID, action, resource, and timestamp.

## Events

- None (audit log records events but does not produce them)

## References

- [Domain Constitution — BC-AUTH](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution — Authentication Invariants](../../constitution/DOMAIN.md#43-authentication-invariants)
- [Domain Constitution — Financial Invariants](../../constitution/DOMAIN.md#41-financial-invariants)
