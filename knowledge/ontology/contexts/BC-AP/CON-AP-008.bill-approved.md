---
id: CON-AP-008
name: BillApproved
context: BC-AP
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - event
  - bill
  - approval
---

# BillApproved

## Definition

Domain event emitted when a vendor bill has been reviewed and approved for payment. This event signals that the bill is ready to be scheduled for payment and may update the bill status and trigger financial postings.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| bill_id | UUID v7 | yes | Reference to CON-AP-003 (Bill) |
| vendor_id | UUID v7 | yes | Reference to CON-AP-001 (Vendor) |
| approved_by | UUID v7 | yes | User who approved the bill |
| approved_at | timestamp | yes | When the bill was approved |
| total_amount | numeric(19,4) | yes | Approved bill amount |
| currency | string(3) | yes | ISO 4217 currency code |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | triggered-by | N:1 | Event is triggered by bill approval |
| CON-AP-014 (ApprovalWorkflow) | enforced-by | N:1 | Approval governed by workflow policy |

## Invariants

- Bill must be in pending_approval status before approval event is emitted.
- Approved amount must match the bill total amount.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
