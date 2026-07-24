---
id: CON-HR-011
name: LeaveRequested
context: BC-HR
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - events
  - leave-management
---

# LeaveRequested

## Definition

A domain event emitted when an employee submits a leave request. This event initiates the approval workflow and notifies the employee's manager for review and approval.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| leave_request_id | UUID | yes | Reference to LeaveRequest |
| employee_id | UUID | yes | Reference to Employee |
| leave_type_id | UUID | yes | Reference to LeaveType |
| start_date | date | yes | Leave start date |
| end_date | date | yes | Leave end date |
| total_days | integer | yes | Total days requested |
| timestamp | timestamp | yes | When the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-005 (LeaveRequest) | triggers | 1:1 | Event is triggered by LeaveRequest creation |
| CON-HR-001 (Employee) | references | N:1 | Event references the requesting employee |

## Invariants

- INV-HR-032: Event must reference a valid leave_request_id.
- INV-CROSS-003: Event ID is a globally unique UUID v7.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
