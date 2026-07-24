---
id: CON-SALES-012
name: CreateSalesOrder
context: BC-SALES
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - order
  - command
---

# CreateSalesOrder

## Definition

A command that represents the intent to create a new sales order. The command carries order details including customer reference, line items, and pricing information. Processing this command validates the order, checks credit limits, and allocates inventory.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| customer_id | UUID v7 | yes | Reference to Customer |
| order_date | date | yes | Date the order is placed |
| expected_delivery_date | date | no | Expected delivery date |
| line_items | array | yes | Array of line item details (item_id, quantity, unit_price) |
| discount_amount | money | no | Order-level discount |
| notes | text | no | Order notes |
| quotation_id | UUID v7 | no | Source quotation if converting from quotation |
| initiated_by | UUID v7 | yes | User initiating the command |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-002 (SalesOrder) | creates | 1:1 | Command creates a sales order |
| CON-SALES-009 (SalesOrderCreated) | results-in | 1:1 | Successful execution emits this event |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- At least one line item is required.
- Customer must exist and be in Active status.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
