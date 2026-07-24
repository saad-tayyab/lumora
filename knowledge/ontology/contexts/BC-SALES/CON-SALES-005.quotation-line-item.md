---
id: CON-SALES-005
name: QuotationLineItem
context: BC-SALES
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - quotation
  - line-item
---

# QuotationLineItem

## Definition

A single line item within a quotation, representing one product or service being offered. Each line item specifies the item, quantity, unit price, and calculated total. Line items are children of the Quotation aggregate and cannot exist independently.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| quotation_id | UUID v7 | yes | Reference to parent Quotation |
| item_id | UUID v7 | yes | Reference to inventory item (BC-INV) |
| description | string(500) | no | Item description override |
| quantity | decimal(12,2) | yes | Quantity offered |
| unit_price | money | yes | Price per unit |
| discount_percent | decimal(5,2) | no | Line-level discount percentage |
| discount_amount | money | no | Line-level discount amount |
| tax_rate | decimal(5,4) | no | Tax rate applied to this line |
| tax_amount | money | no | Tax amount for this line |
| total | money | yes | Line total (quantity × unit_price − discounts + tax) |
| created_at | timestamp | yes | Record creation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-004 (Quotation) | belongs-to | N:1 | Line item belongs to a quotation |

## Invariants

- INV-CROSS-003: LineItem ID is a globally unique UUID v7.
- Quantity must be greater than zero.
- Unit price must be non-negative.

## Events

- QuotationLineItemAdded
- QuotationLineItemUpdated
- QuotationLineItemRemoved

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
