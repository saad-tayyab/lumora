---
id: CON-AP-004
name: BillLineItem
context: BC-AP
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - bill
  - line-item
---

# BillLineItem

## Definition

A single line item within a vendor bill, representing one distinct good or service being purchased. Each line item references a specific item or expense category and carries its own quantity, unit price, and tax information.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| bill_id | UUID v7 | yes | Reference to CON-AP-003 (Bill) |
| item_id | UUID v7 | no | Reference to item from BC-INV (if applicable) |
| description | string(500) | yes | Description of the line item |
| quantity | numeric(12,4) | yes | Quantity of goods or services |
| unit_price | numeric(19,4) | yes | Price per unit |
| amount | numeric(19,4) | yes | Line total (quantity x unit_price) |
| tax_rate | numeric(5,4) | no | Applicable tax rate |
| tax_amount | numeric(19,4) | no | Tax amount for this line |
| purchase_order_line_id | UUID v7 | no | Reference to linked PO line from BC-PROC |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-003 (Bill) | belongs-to | N:1 | Line item belongs to one bill |

## Invariants

- INV-FIN-004: Amounts stored with decimal precision.
- Line item amount must equal quantity multiplied by unit price.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
