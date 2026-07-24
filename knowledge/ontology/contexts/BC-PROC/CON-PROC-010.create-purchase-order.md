---
id: CON-PROC-010
name: CreatePurchaseOrder
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

# CreatePurchaseOrder

## Definition

A command representing the intent to create a new Purchase Order. This command encapsulates all data required to initiate a procurement request, including vendor selection, line items, and shipping details.

## Command Payload

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vendor_id | UUID | yes | Vendor to order from (CON-PROC-001) |
| order_date | date | yes | Date of the order |
| expected_delivery_date | date | no | Expected delivery date |
| shipping_address_line1 | string(200) | yes | Delivery address line 1 |
| shipping_address_line2 | string(200) | no | Delivery address line 2 |
| shipping_city | string(100) | yes | Delivery city |
| shipping_state | string(100) | yes | Delivery state |
| shipping_postal_code | string(20) | yes | Delivery postal code |
| shipping_country | string(3) | yes | Delivery country |
| currency | string(3) | yes | ISO 4217 currency code |
| payment_terms | string(50) | yes | Payment terms |
| line_items | array | yes | Array of line item data |
| notes | text | no | Internal notes |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | creates | 1:1 | Command creates a PO |
| CON-PROC-001 (Vendor) | references | N:1 | Command references a vendor |
| CON-PROC-007 (PurchaseOrderCreated) | produces | 1:1 | Command produces this event |

## Invariants

- INV-PROC-026: Vendor must exist and be in "active" status.
- INV-PROC-027: At least one line item must be provided.

## Business Rules

- The command validates the vendor exists and is qualified before creating the PO.
- PO numbers are auto-generated following tenant-specific numbering convention.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
