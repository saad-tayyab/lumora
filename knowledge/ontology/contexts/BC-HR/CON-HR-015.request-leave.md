---
id: CON-HR-015
name: RequestLeave
context: BC-HR
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - commands
  - leave-management
---

# RequestLeave

## Definition

A command representing the intent to submit a leave request. When executed, creates a LeaveRequest aggregate in Pending status and emits the LeaveRequested event which initiates the approval workflow.

## Command Payload

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| employee_id | UUID | yes | Reference to Employee |
| leave_type_id | UUID | yes | Reference to LeaveType |
| start_date | date | yes | Leave start date |
| end_date | date | yes | Leave end date |
| reason | string(1000) | no | Reason for leave |

## Execution Flow

1. Validate employee is active.
2. Validate leave type exists and is active.
3. Check employee leave balance for the requested type.
4. Calculate total_days from date range.
5. Create LeaveRequest aggregate (status: Pending).
6. Emit LeaveRequested event.
7. Notify employee's manager for approval.

## Invariants

- INV-HR-040: Employee must be Active to request leave.
- INV-HR-041: End date must be on or after start date.
- INV-HR-042: Employee must have sufficient leave balance.

## Business Rules

- BR-006: Leave requests require manager approval.

## References

- [Domain Constitution - BC-HR](../../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Constitution - Business Rules](../../../constitution/DOMAIN.md#5-business-rules-registry)
