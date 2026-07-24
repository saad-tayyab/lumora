---
id: CON-PROC-011
name: ApprovePurchaseOrder
context: BC-PROC
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - purchase-order
  - command
---

# ApprovePurchaseOrder

## Definition

A command representing the intent to approve a pending Purchase Order. This command validates that the PO meets the approval policy requirements before authorizing it for vendor transmission.

## Command Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| po_id | UUID | yes | Purchase order to approve (CON-PROC-002) |
| approver_id | UUID | yes | User performing the approval |
| notes | text | no | Approval notes |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | targets | N:1 | Command targets a specific PO |
| CON-PROC-014 (POApprovalPolicy) | enforces | N:1 | Command must comply with approval policy |
| CON-PROC-008 (PurchaseOrderApproved) | produces | 1:1 | Command produces this event |

## Invariants

- INV-PROC-028: PO must be in "pending_approval" status to be approved.
- INV-PROC-029: Approver must have approval authority for the PO amount.
- INV-PROC-030: PO must pass all POApprovalPolicy checks.

## Business Rules

- Approval authority is determined by the PO total amount and organizational approval matrix.
- The command validates the approver's authority before proceeding.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
