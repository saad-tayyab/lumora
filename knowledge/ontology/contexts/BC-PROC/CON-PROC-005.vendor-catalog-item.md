---
id: CON-PROC-005
name: VendorCatalogItem
context: BC-PROC
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - vendor
  - catalog
---

# VendorCatalogItem

## Definition

An immutable value object representing a product or service as listed in a vendor's catalog. Identifies the vendor-specific item code, description, and pricing. Used to map internal items to vendor offerings for streamlined procurement.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| vendor_id | UUID | yes | Reference to vendor (CON-PROC-001) |
| vendor_item_code | string(50) | yes | Vendor's item code or SKU |
| internal_item_id | UUID | no | Mapped internal inventory item (BC-INV) |
| description | string(500) | yes | Vendor's item description |
| unit_price | numeric(19,4) | yes | Vendor's listed unit price |
| currency | string(3) | yes | ISO 4217 currency code |
| unit_of_measure | string(20) | yes | Vendor's unit of measure |
| lead_time_days | integer | no | Vendor's typical lead time in days |
| minimum_order_quantity | numeric(19,4) | no | Minimum order quantity |
| effective_date | date | yes | Date from which pricing is valid |
| expiry_date | date | no | Date until which pricing is valid |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-001 (Vendor) | belongs-to | N:1 | Catalog item belongs to a vendor |
| CON-PROC-003 (POLineItem) | referenced-by | N:1 | Line items may reference catalog items |

## Invariants

- INV-PROC-016: Vendor item code must be unique within a vendor's catalog.
- INV-PROC-017: Unit price must be non-negative.
- INV-PROC-018: Effective date must be before or equal to expiry date (if set).

## Business Rules

- Vendor catalog items are used to auto-populate PO line items with correct pricing and item codes.

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
