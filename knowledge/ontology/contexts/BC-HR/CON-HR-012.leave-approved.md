---
id: CON-HR-012
name: LeaveApproved
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

# LeaveApproved

## Definition

A domain event emitted when a manager approves a leave request. This event updates the employee's leave balance and may trigger notifications to the employee.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| leave_request_id | UUID | yes | Reference to LeaveRequest |
| employee_id | UUID | yes | Reference to Employee |
| approver_id | UUID | yes | Reference to Employee (approving manager) |
| approval_date | timestamp | yes | Date/time of approval |
| timestamp | timestamp | yes | When the event occurred |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-005 (LeaveRequest) | triggers | 1:1 | Event is triggered by leave approval |
| CON-HR-001 (Employee) | references | N:1 | Event references the employee |

## Invariants

- INV-HR-033: Event must reference a valid leave_request_id.
- INV-HR-034: Approver must be the employee's manager (enforced by LeaveApprovalPolicy).
- INV-CROSS-003: Event ID is a globally unique UUID v7.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
