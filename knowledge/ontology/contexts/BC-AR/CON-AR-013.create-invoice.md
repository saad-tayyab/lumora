---
id: CON-AR-013
name: CreateInvoice
context: BC-AR
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - command
  - invoice
---

# CreateInvoice

## Definition

A command representing the intent to create a new invoice for a customer. When executed, this command validates the customer's credit status, generates line items, calculates totals, and persists the invoice. On success, it emits an InvoiceCreated event.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| customer_id | UUID v7 | yes | Reference to Customer (CON-AR-001) |
| issue_date | date | yes | Date the invoice is issued |
| due_date | date | yes | Payment due date |
| line_items | array | yes | Array of line item descriptions, quantities, and prices |
| currency | string(3) | yes | ISO 4217 currency code |
| notes | text | no | Additional notes |
| tax_rate | numeric(5,4) | no | Default tax rate for all lines |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-002 (Invoice) | targets | — | Creates an Invoice aggregate |
| CON-AR-016 (CreditApprovalPolicy) | enforces | — | Must pass credit approval before creation |

## Invariants

- INV-FIN-004: All monetary values use decimal precision.

## Business Rules

- BR-003: Payment terms are defined per customer and determine the due_date.

## Events

- Emits InvoiceCreated (CON-AR-009) on success.

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
