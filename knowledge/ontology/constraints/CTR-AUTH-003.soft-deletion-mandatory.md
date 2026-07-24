---
id: CTR-AUTH-003
concept: CON-AUTH-001
attribute: deleted_at
type: invariant
scope: global
description: "Soft deletion is mandatory for all user-facing entities (INV-AUTH-003)"
severity: error
version: 1.0.0
---

# Soft Deletion Mandatory

## Definition

All user-facing entities must use soft deletion. Records must never be physically removed from the database. The `deleted_at` timestamp must be set instead.

## Concept

- **CON-AUTH-001** (User) — Aggregate root

## Invariant

- **INV-AUTH-003:** Soft deletion is mandatory for all user-facing entities.

## Business Rule

- Deleted records must be excluded from normal queries.
- Deleted records must be retained for audit and compliance purposes.
- Restoration of soft-deleted records must be logged in the audit trail.
