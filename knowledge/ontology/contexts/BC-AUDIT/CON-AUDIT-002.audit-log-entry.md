---
id: CON-AUDIT-002
name: Audit Log Entry
context: BC-AUDIT
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - audit
  - compliance
  - state-change
  - traceability
---

# Audit Log Entry

## Definition

A single record capturing one state change in the system. Each entry documents who performed an action, what entity was affected, when it occurred, and the before/after state. Entries are immutable once created — they cannot be updated or deleted.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Globally unique identifier |
| tenantId | UUID | Tenant isolation key |
| userId | UUID | Reference to the user who performed the action (or system process ID) |
| entityType | varchar(100) | Type of entity affected (e.g., Invoice, JournalEntry, Employee) |
| entityId | UUID | ID of the affected entity |
| action | enum | create, update, delete, restore, approve, reject, post, void |
| oldValues | jsonb | Previous state of the entity before the change (nullable for create) |
| newValues | jsonb | New state of the entity after the change (nullable for delete) |
| ipAddress | varchar(45) | Client IP address (IPv4 or IPv6) |
| userAgent | text | Client user agent string |
| timestamp | timestamp | When the action occurred |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-AUDIT-001 Audit Log | belongs-to | Entry belongs to the tenant's audit log |
| CON-AUDIT-003 Entity Change Snapshot | has-one | Entry contains a structured change snapshot |
| CON-AUTH-001 User | uses | Entry references the user who performed the action |

## Invariants

- INV-AUDIT-001: Audit log entries are append-only; no updates or deletes permitted
- INV-AUDIT-002: Every audit log entry must reference an entity type and entity ID
- INV-AUDIT-003: Every audit log entry must include old and new values for update operations

## Business Rules

- BR-021: All state-changing operations must create an audit log entry
- BR-022: Audit log entries must not be modifiable or deletable
- BR-023: Audit log entries must include old and new values for updates

## Events

- EVT-011: AuditLogCreated

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-021, BR-022, BR-023
