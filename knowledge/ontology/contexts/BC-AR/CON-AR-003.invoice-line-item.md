---
id: CON-AR-003
name: InvoiceLineItem
context: BC-AR
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - invoice
  - line-item
---

# InvoiceLineItem

## Definition

A single line within an invoice representing a specific product or service being billed. Each line item contains the description, quantity, unit price, and calculated amount. Line items are children of the Invoice aggregate.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| invoice_id | UUID v7 | yes | Reference to parent Invoice (CON-AR-002) |
| description | string(500) | yes | Description of the product or service |
| quantity | numeric(10,4) | yes | Quantity of units |
| unit_price | numeric(19,4) | yes | Price per unit |
| amount | numeric(19,4) | yes | Line total (quantity * unit_price) |
| tax_rate | numeric(5,4) | no | Tax rate applied to this line |
| tax_amount | numeric(19,4) | no | Tax amount for this line |
| sort_order | integer | yes | Display order of the line item |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-002 (Invoice) | belongs-to | N:1 | Line item belongs to an invoice |

## Invariants

- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-CROSS-003: InvoiceLineItem has a globally unique identifier (UUID v7).
- CTR-AR-005: Line item quantity must be positive.

## Business Rules

- None beyond invariants.

## Events

- None (child entity of Invoice aggregate).

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
