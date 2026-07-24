---
id: CON-PROC-002
name: PurchaseOrder
context: BC-PROC
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - purchase-order
  - core
---

# PurchaseOrder

## Definition

An aggregate root representing a formal document issued by the organization to a vendor, requesting goods or services at specified prices and terms. The Purchase Order is the central entity in the procurement process and enforces consistency boundaries for line items.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| po_number | string(30) | yes | Human-readable PO number (unique within tenant) |
| vendor_id | UUID | yes | Reference to vendor (CON-PROC-001) |
| status | POStatus | yes | Current status of the PO (CON-PROC-006) |
| order_date | date | yes | Date the PO was created |
| expected_delivery_date | date | no | Expected delivery date |
| shipping_address_line1 | string(200) | yes | Delivery address line 1 |
| shipping_address_line2 | string(200) | no | Delivery address line 2 |
| shipping_city | string(100) | yes | Delivery city |
| shipping_state | string(100) | yes | Delivery state or province |
| shipping_postal_code | string(20) | yes | Delivery postal code |
| shipping_country | string(3) | yes | Delivery country (ISO 3166-1 alpha-3) |
| currency | string(3) | yes | ISO 4217 currency code |
| subtotal | numeric(19,4) | yes | Sum of line item amounts (before tax) |
| tax_amount | numeric(19,4) | yes | Total tax amount |
| total | numeric(19,4) | yes | Grand total (subtotal + tax) |
| payment_terms | string(50) | yes | Payment terms for this order |
| notes | text | no | Internal notes |
| created_by | UUID | yes | User who created the PO |
| approved_by | UUID | no | User who approved the PO |
| approved_at | timestamp | no | Timestamp of approval |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-001 (Vendor) | belongs-to | N:1 | PO is issued to a vendor |
| CON-PROC-003 (POLineItem) | has-many | 1:N | PO contains line items |
| CON-PROC-004 (ReceivingReport) | has-many | 1:N | PO may have receiving reports |
| CON-PROC-006 (POStatus) | uses | 1:1 | PO has a status value object |

## Invariants

- INV-PROC-003: A PO must have at least one line item to be submitted.
- INV-PROC-004: PO total must equal the sum of all line item amounts plus tax.
- INV-PROC-005: A PO can only be approved when status is "pending_approval".
- INV-PROC-006: A PO cannot be modified after approval.
- INV-PROC-007: PO numbers must be unique within a tenant.
- INV-CROSS-003: PurchaseOrder ID is a globally unique UUID v7.
- INV-CROSS-001: No other bounded context may directly access PO database tables.

## Business Rules

- BR-004 (from DOMAIN.md): Three-way matching required for PO-based bills (PO, receiving report, vendor invoice).
- BR-005 (from DOMAIN.md): Reorder points trigger automated purchase suggestions.

## Events

- CON-PROC-007 (PurchaseOrderCreated): Emitted when a new PO is created.
- CON-PROC-008 (PurchaseOrderApproved): Emitted when a PO is approved.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
