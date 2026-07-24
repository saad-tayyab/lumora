---
id: CON-PROC-004
name: ReceivingReport
context: BC-PROC
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - receiving
  - inventory
---

# ReceivingReport

## Definition

A document recording the physical receipt of goods against a Purchase Order. The receiving report captures what was actually delivered, enabling three-way matching (PO, receiving report, vendor invoice) as required by BR-004.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| rr_number | string(30) | yes | Human-readable receiving report number |
| po_id | UUID | yes | Reference to purchase order (CON-PROC-002) |
| vendor_id | UUID | yes | Reference to vendor (CON-PROC-001) |
| received_date | date | yes | Date goods were received |
| received_by | UUID | yes | User who received the goods |
| warehouse_id | UUID | yes | Destination warehouse (BC-INV) |
| status | enum | yes | draft, confirmed, rejected |
| notes | text | no | Receiving notes or discrepancies |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | belongs-to | N:1 | Receiving report references a PO |
| CON-PROC-001 (Vendor) | belongs-to | N:1 | Goods received from a vendor |

## Invariants

- INV-PROC-013: Receiving report must reference a valid purchase order.
- INV-PROC-014: Receiving report numbers must be unique within a tenant.
- INV-PROC-015: Received date cannot be before the PO order date.

## Business Rules

- BR-004 (from DOMAIN.md): Receiving report is used in three-way matching with PO and vendor invoice.
- BR-008 (from DOMAIN.md): Bank reconciliation requires matching — receiving reports support this by confirming delivery before payment.

## Events

- CON-PROC-009 (GoodsReceived): Emitted when goods are confirmed as received.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
