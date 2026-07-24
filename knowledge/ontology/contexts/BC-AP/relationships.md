---
title: BC-AP Relationships
version: 1.0.0
status: active
context: BC-AP
---

# BC-AP (Accounts Payable) — Relationships

## Intra-Context Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-001 | CON-AP-001 (Vendor) | CON-AP-003 (Bill) | has-many | 1:N | A vendor receives many bills |
| REL-002 | CON-AP-003 (Bill) | CON-AP-004 (BillLineItem) | has-many | 1:N | A bill contains many line items |
| REL-003 | CON-AP-003 (Bill) | CON-AP-005 (PaymentSchedule) | has-one | 1:1 | A bill has one payment schedule |
| REL-004 | CON-AP-010 (CreateBill) | CON-AP-003 (Bill) | triggers | 1:1 | CreateBill command creates a Bill |
| REL-005 | CON-AP-003 (Bill) | CON-AP-007 (BillReceived) | triggers | 1:1 | Bill creation triggers BillReceived event |
| REL-006 | CON-AP-003 (Bill) | CON-AP-008 (BillApproved) | triggers | 1:1 | Bill approval triggers BillApproved event |
| REL-007 | CON-AP-011 (ApproveBill) | CON-AP-003 (Bill) | triggers | 1:1 | ApproveBill command targets a Bill |
| REL-008 | CON-AP-012 (ProcessPayment) | CON-AP-002 (VendorPayment) | triggers | 1:1 | ProcessPayment creates VendorPayment |
| REL-009 | CON-AP-012 (ProcessPayment) | CON-AP-009 (BillPaid) | triggers | 1:N | ProcessPayment emits BillPaid events |
| REL-010 | CON-AP-013 (ThreeWayMatchPolicy) | CON-AP-006 (ThreeWayMatchResult) | enforces | 1:N | Policy enforces match results |
| REL-011 | CON-AP-014 (ApprovalWorkflow) | CON-AP-008 (BillApproved) | enforces | 1:N | Workflow enforces approval events |
| REL-012 | CON-AP-002 (VendorPayment) | CON-AP-003 (Bill) | uses | N:N | Payment pays one or more bills |

## Cross-Context Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-013 | CON-AP-007 (BillReceived) | BC-FIN | triggers | 1:N | BillReceived may trigger journal entry in BC-FIN |
| REL-014 | CON-AP-009 (BillPaid) | BC-FIN | triggers | 1:N | BillPaid triggers journal entry in BC-FIN |

## Aggregate Boundaries

| Aggregate Root | Child Entities | Value Objects |
|---------------|---------------|---------------|
| CON-AP-003 (Bill) | CON-AP-004 (BillLineItem) | CON-AP-005 (PaymentSchedule) |
| CON-AP-002 (VendorPayment) | — | — |

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- [Ontology Standards](../../STANDARDS.md)
