---
id: CON-PROC-003
name: POLineItem
context: BC-PROC
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - purchase-order
  - line-item
---

# POLineItem

## Definition

A line item within a Purchase Order, representing a single product or service being procured. Each line item specifies the item, quantity, unit price, and amount. Line items are part of the PurchaseOrder aggregate and cannot exist independently.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| po_id | UUID | yes | Parent purchase order (CON-PROC-002) |
| line_number | integer | yes | Sequential line number within the PO |
| item_id | UUID | yes | Reference to inventory item (BC-INV) |
| description | string(500) | yes | Item description |
| quantity | numeric(19,4) | yes | Ordered quantity |
| unit_of_measure | string(20) | yes | Unit of measure (e.g., "EA", "KG", "BOX") |
| unit_price | numeric(19,4) | yes | Price per unit |
| amount | numeric(19,4) | yes | Line total (quantity * unit_price) |
| tax_rate | numeric(5,4) | no | Tax rate for this line item |
| tax_amount | numeric(19,4) | no | Tax amount for this line item |
| received_quantity | numeric(19,4) | yes | Quantity received so far (default 0) |
| notes | text | no | Line-specific notes |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | belongs-to | N:1 | Line item belongs to a PO |
| CON-PROC-005 (VendorCatalogItem) | uses | N:1 | Line item may reference a catalog item |

## Invariants

- INV-PROC-008: Line item amount must equal quantity * unit_price.
- INV-PROC-009: Line numbers must be unique within a PO.
- INV-PROC-010: Received quantity cannot exceed ordered quantity.
- INV-PROC-011: Quantity must be greater than zero.
- INV-PROC-012: Unit price must be non-negative.

## Business Rules

- BR-004 (from DOMAIN.md): Three-way matching uses PO line item quantities and prices for comparison with receiving reports and vendor invoices.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
