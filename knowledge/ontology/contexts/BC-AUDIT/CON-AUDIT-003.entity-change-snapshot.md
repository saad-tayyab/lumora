---
id: CON-AUDIT-003
name: Entity Change Snapshot
context: BC-AUDIT
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - audit
  - snapshot
  - change-tracking
  - value-object
---

# Entity Change Snapshot

## Definition

An immutable value object representing the structured old/new values pair captured in an audit log entry. It decomposes the raw JSONB payloads into a typed array of field-level changes, enabling precise diffing and compliance reporting. This snapshot is derived from the oldValues and newValues stored on CON-AUDIT-002.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| entityType | varchar(100) | Type of entity that was changed |
| entityId | UUID | ID of the entity that was changed |
| action | enum | create, update, delete, restore, approve, reject, post, void |
| changes | array | List of field-level changes, each with: field (string), oldValue (any), newValue (any) |

## Relationships

| Related Concept | Relationship | Description |
|----------------|--------------|-------------|
| CON-AUDIT-002 Audit Log Entry | used-by | Snapshot is embedded within an audit log entry |

## Invariants

- INV-AUDIT-003: For update actions, changes must include old and new values for each modified field

## Business Rules

- BR-023: Audit log entries must include old and new values for updates

## Events

- None (value object; does not produce events)

## Source

- Domain constitution: `knowledge/constitution/DOMAIN.md`
- Business rules: BR-023
