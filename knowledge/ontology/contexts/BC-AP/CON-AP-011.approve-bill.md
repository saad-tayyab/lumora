---
id: CON-AP-011
name: ApproveBill
context: BC-AP
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - command
  - bill
  - approval
---

# ApproveBill

## Definition

Command representing the intent to approve a vendor bill for payment. When executed, this command transitions the bill from pending_approval to approved status, subject to the ApprovalWorkflow policy, and emits a BillApproved event.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| bill_id | UUID v7 | yes | Reference to CON-AP-003 (Bill) |
| approved_by | UUID v7 | yes | User approving the bill |
| notes | text | no | Approval notes or comments |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | targets | 1:1 | Command targets one bill |
| CON-AP-008 (BillApproved) | triggers | 1:1 | Command execution emits BillApproved |
| CON-AP-014 (ApprovalWorkflow) | enforced-by | 1:1 | Approval governed by workflow policy |

## Invariants

- Bill must be in pending_approval status.
- Approver must have the required role/permissions.
- If bill is PO-linked, three-way match must pass before approval.

## Business Rules

- BR-004: Three-way matching required for PO-based bills (must pass before approval).

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
