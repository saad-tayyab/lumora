---
id: CTR-AUDIT-001
name: Audit Log Append-Only
context: BC-AUDIT
type: invariant
description: "Audit log entries must not be updated or deleted after creation"
severity: critical
version: 1.0.0
status: active
---

# CTR-AUDIT-001: Audit Log Append-Only

## Statement

Audit log entries must not be updated or deleted after creation.

## Rationale

Preserves the integrity and trustworthiness of the audit trail. Any modification or deletion would compromise compliance and forensics capabilities.

## Implementation

- Enforce append-only access at the database level (no UPDATE or DELETE operations on audit_log table).
- Application layer must not expose edit or delete endpoints for audit log entries.
- Database triggers or row-level security policies should prevent unauthorized mutations.

## Invariant Reference

- INV-AUDIT-001: Audit log entries are append-only; no updates or deletes permitted.

## Business Rule Reference

- BR-022: Audit log entries must not be modifiable or deletable.
