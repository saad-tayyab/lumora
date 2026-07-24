---
id: REL-AUDIT-001
source: CON-AUDIT-002
target: CON-AUTH-001
type: uses
cardinality: "N:1"
required: true
description: "Each audit log entry references the user who performed the action"
version: 1.0.0
status: active
---

# REL-AUDIT-001: AuditLogEntry uses User

## Source

- **CON-AUDIT-002** (AuditLogEntry) — Entity

## Target

- **CON-AUTH-001** (User) — Aggregate root

## Description

Each audit log entry references the user who performed the action. This ensures every state change in the system is attributable to a specific user, supporting compliance and traceability requirements.

## Constraints

- INV-AUDIT-001: Audit log entries are append-only; no updates or deletes permitted.
- INV-AUDIT-002: Every audit log entry must reference an entity type and entity ID.
- INV-AUTH-001: Every action must be attributable to a user or system process.
- BR-021: All state-changing operations must create an audit log entry.
