---
id: CON-HR-017
name: LeaveApprovalPolicy
context: BC-HR
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - hr
  - policies
  - leave-management
---

# LeaveApprovalPolicy

## Definition

A business policy that enforces the rule that leave requests must be approved by the employee's direct manager. Implements BR-006 from the Domain Constitution. Validates that the approver is authorized and that the leave request meets all requirements before approval.

## Policy Rules

1. **Manager Authorization**: Only the employee's direct manager (referenced via `manager_id` on Employee) can approve or reject a leave request.
2. **Active Employee**: The requesting employee must have Active status.
3. **Valid Leave Type**: The leave type must exist and be Active.
4. **Sufficient Balance**: The employee must have sufficient remaining leave days for the requested type.
5. **No Overlap**: The requested dates must not overlap with existing approved leave requests.
6. **Delegation**: If the manager is unavailable, approval can be delegated to a higher-level manager in the same department hierarchy.

## Policy Evaluation

| Condition | Action |
|-----------|--------|
| Approver is not the employee's manager | Reject with "Unauthorized approver" |
| Employee is not Active | Reject with "Employee not active" |
| Leave type is inactive | Reject with "Invalid leave type" |
| Insufficient leave balance | Reject with "Insufficient leave balance" |
| Dates overlap with approved leave | Reject with "Date conflict" |
| All conditions pass | Approve and emit LeaveApproved event |

## Invariants

- INV-HR-046: Policy enforces BR-006 (Leave requests require manager approval).
- INV-HR-047: Policy evaluation must be deterministic for same inputs.

## References

- [Domain Constitution - Business Rules](../../../constitution/DOMAIN.md#5-business-rules-registry)
- [BR-006: Leave requests require manager approval](../../../constitution/DOMAIN.md#5-business-rules-registry)
