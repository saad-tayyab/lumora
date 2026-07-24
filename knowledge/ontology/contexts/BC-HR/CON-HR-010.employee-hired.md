---
id: CON-HR-010
name: EmployeeHired
context: BC-HR
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - events
  - cross-context
---

# EmployeeHired

## Definition

A domain event emitted when a new employee is successfully hired and their record is created in the HR system. This event triggers the creation of a corresponding user account in the Authentication context (BC-AUTH) via cross-context communication.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| employee_id | UUID | yes | Reference to newly hired Employee |
| user_id | UUID | no | Reference to BC-AUTH User (set after auth creation) |
| department_id | UUID | yes | Reference to Department |
| designation_id | UUID | yes | Reference to Designation |
| hire_date | date | yes | Date of employment commencement |
| timestamp | timestamp | yes | When the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-001 (Employee) | triggers | 1:1 | Event is triggered by Employee creation |
| BC-AUTH (User) | triggers | 1:1 | Event triggers user account creation |

## Invariants

- INV-HR-031: Event must reference a valid employee_id.
- INV-CROSS-002: Cross-context communication happens through domain events only.
- INV-CROSS-003: Event ID is a globally unique UUID v7.

## Event Metadata

| Field | Value |
|-------|-------|
| Event ID (Catalog) | EVT-005 |
| Source Context | BC-HR |
| Target Contexts | BC-AUTH |
| Payload | EmployeeID, UserID |

## References

- [Domain Constitution - Event Catalog](../../../constitution/DOMAIN.md#7-event-catalog)
- [Domain Constitution - Cross-Context Invariants](../../../constitution/DOMAIN.md#44-cross-context-invariants)
