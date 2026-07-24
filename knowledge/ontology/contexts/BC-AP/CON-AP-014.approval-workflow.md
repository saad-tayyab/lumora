---
id: CON-AP-014
name: ApprovalWorkflow
context: BC-AP
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - policy
  - approval
  - workflow
---

# ApprovalWorkflow

## Definition

Business policy that governs the approval process for vendor bills before they can be paid. Defines approval thresholds, required approvers, and escalation rules based on bill amount and vendor. Ensures proper segregation of duties and compliance.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(100) | yes | Policy name |
| single_approver_threshold | numeric(19,4) | yes | Max bill amount for single approval |
| dual_approver_threshold | numeric(19,4) | yes | Max bill amount requiring two approvers |
| escalation_threshold | numeric(19,4) | yes | Amount requiring executive approval |
| max_approval_days | integer | yes | Maximum days for approval before escalation |
| requires_three_way_match | boolean | yes | Whether PO-linked bills must match before approval |
| is_active | boolean | yes | Whether policy is currently enforced |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | applies-to | 1:N | Policy applies to bills awaiting approval |
| CON-AP-008 (BillApproved) | enforces | 1:N | Policy governs approval events |
| CON-AP-011 (ApproveBill) | enforces | 1:1 | Policy governs approval commands |

## Invariants

- Thresholds must be in ascending order (single < dual < escalation).
- Max approval days must be positive.
- Policy must be active to be enforced.

## Business Rules

- Bills below single_approver_threshold require one approver.
- Bills between single and dual thresholds require two approvers.
- Bills above escalation_threshold require executive approval.
- BR-004: PO-linked bills must pass three-way match before approval (when requires_three_way_match is true).

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- [Business Rules Registry - BR-004](../../../../constitution/DOMAIN.md#5-business-rules-registry)
