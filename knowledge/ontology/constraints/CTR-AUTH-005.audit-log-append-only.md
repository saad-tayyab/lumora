---
id: CTR-AUTH-005
concept: CON-AUTH-008
attribute: id
type: invariant
scope: global
description: "Audit logs are append-only and must never be modified or deleted"
severity: error
version: 1.0.0
---

# Audit Log Append-Only

## Definition

Audit log records are immutable once written. They must never be modified, updated, or deleted. This ensures a complete and trustworthy audit trail.

## Concept

- **CON-AUTH-008** (AuditLog) — Entity

## Invariant

- INV-AUTH-001: Every action must be attributable to a user or system process.
- INV-FIN-003: Every financial transaction must have an audit trail.

## Business Rule

- Database-level constraints must prevent UPDATE and DELETE operations on audit logs.
- Audit log retention must be a minimum of 7 years.
- Audit log integrity must be verifiable via checksums.
