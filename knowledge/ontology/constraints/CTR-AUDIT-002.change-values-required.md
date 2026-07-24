---
id: CTR-AUDIT-002
name: Change Values Required
context: BC-AUDIT
type: invariant
description: "Audit log entries for update actions must include both old and new values"
severity: error
version: 1.0.0
status: active
---

# CTR-AUDIT-002: Change Values Required

## Statement

Audit log entries for update actions must include both old and new values.

## Rationale

Enables full traceability of what changed and by how much. Without both values, the audit trail cannot support forensic analysis or compliance review.

## Implementation

- When recording an update action, capture and store both the previous state (`old_values`) and the resulting state (`new_values`) as JSON blobs.
- Reject or raise an error if an update audit entry is created without both fields populated.

## Invariant Reference

- INV-AUDIT-003: Audit log entries for update actions must include old and new values.

## Business Rule Reference

- BR-023: Audit log entries must include old and new values for updates.
