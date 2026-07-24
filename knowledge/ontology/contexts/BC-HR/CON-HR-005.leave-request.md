---
id: CON-HR-005
name: LeaveRequest
context: BC-HR
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - leave-management
---

# LeaveRequest

## Definition

An aggregate representing an employee's request for time off. Encapsulates the leave type, date range, reason, and approval workflow. Subject to the LeaveApprovalPolicy which requires manager approval (BR-006).

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| employee_id | UUID | yes | Reference to Employee |
| leave_type_id | UUID | yes | Reference to LeaveType |
| start_date | date | yes | Leave start date |
| end_date | date | yes | Leave end date |
| total_days | integer | yes | Total days requested |
| reason | string(1000) | no | Reason for leave request |
| status | enum | yes | Pending, Approved, Rejected, Cancelled |
| approver_id | UUID | no | Reference to Employee (approving manager) |
| approval_date | timestamp | no | Date/time of approval/rejection |
| rejection_reason | string(500) | no | Reason if rejected |
| created_at | timestamp | yes | Record creation time |
| updated_at | timestamp | yes | Last modification time |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-HR-001 (Employee) | belongs-to | N:1 | Leave request belongs to an employee |
| CON-HR-006 (LeaveType) | belongs-to | N:1 | Leave request is for a specific leave type |
| CON-HR-001 (Employee) | uses | N:1 | Approved by a manager (approver_id) |

## Invariants

- INV-HR-012: End date must be on or after start date.
- INV-HR-013: Total days must be positive.
- INV-HR-014: Leave request cannot be approved if employee is terminated.
- INV-HR-015: Status transitions follow: Pending → Approved/Rejected, Pending → Cancelled.

## Business Rules

- BR-006: Leave requests require manager approval.

## Events

- LeaveRequested (CON-HR-011)
- LeaveApproved (CON-HR-012)
- LeaveRejected

## References

- [Domain Constitution - Business Rules](../../../constitution/DOMAIN.md#5-business-rules-registry)
- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
