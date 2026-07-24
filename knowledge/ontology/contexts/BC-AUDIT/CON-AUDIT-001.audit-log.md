---
id: CON-AUDIT-001
name: Audit Log
context: BC-AUDIT
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - audit
  - compliance
  - append-only
  - traceability
---

# Audit Log

## Definition

The root aggregate for the append-only audit log within a tenant. It serves as the aggregate boundary that owns all audit log entries, enforcing immutability invariants across the entire audit trail. The audit log is the system's authoritative record of every state change, ensuring full traceability and regulatory compliance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| totalEntries | bigint | Running count of entries in this log |
| firstEntryAt | timestamp | Timestamp of the very first entry |
| lastEntryAt | timestamp | Timestamp of the most recent entry |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-AUDIT-002 Audit Log Entry | has-many | The log owns all entries within the tenant |
| CON-AUTH-001 User | uses | Entries reference the user who performed the action |

## Invariants

- INV-AUDIT-001: Audit log entries are append-only; no updates or deletes permitted
- INV-AUDIT-002: Every audit log entry must reference an entity type and entity ID
- INV-AUDIT-003: Every audit log entry must include old and new values for update operations

## Business Rules

- BR-021: All state-changing operations must create an audit log entry
- BR-022: Audit log entries must not be modifiable or deletable

## Events

- EVT-011: AuditLogCreated

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-021, BR-022
