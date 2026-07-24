---
id: CTR-AUTH-006
concept: CON-AUTH-001
attribute: id
type: invariant
scope: global
description: "INV-AUTH-001: Every action must be attributable to a user or system process"
severity: error
version: 1.0.0
---

# Every Action Attributable

## Definition

Every action performed in the system must be attributable to either a specific user or a identified system process. No action may occur anonymously.

## Concept

- **CON-AUTH-001** (User) — Aggregate root

## Invariant

- **INV-AUTH-001:** Every action must be attributable to a user or system process.

## Business Rule

- System processes must have a well-known identifier (e.g., "system", "scheduler", "migration").
- Audit logs must always include the actor identifier.
- Actions performed by system processes must be clearly distinguishable from user actions.
