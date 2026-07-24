---
id: CON-AR-002
name: Invoice
context: BC-AR
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-receivable
  - invoice
  - core
---

# Invoice

## Definition

A document issued by the business to a customer requesting payment for goods or services provided. The Invoice is the aggregate root for the Accounts Receivable context, containing line items and maintaining the total amount due. It enforces consistency for billing operations.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| customer_id | UUID v7 | yes | Reference to Customer (CON-AR-001) |
| invoice_number | string(50) | yes | Human-readable invoice number |
| status | enum | yes | Draft, Sent, Paid, Overdue, Voided |
| issue_date | date | yes | Date the invoice was issued |
| due_date | date | yes | Date the payment is due |
| subtotal | numeric(19,4) | yes | Sum of line item amounts before tax |
| tax_amount | numeric(19,4) | yes | Total tax amount |
| total_amount | numeric(19,4) | yes | Total amount due (subtotal + tax) |
| amount_paid | numeric(19,4) | yes | Total amount already paid |
| balance_due | numeric(19,4) | yes | Remaining amount (total - amount_paid) |
| currency | string(3) | yes | ISO 4217 currency code |
| notes | text | no | Additional notes or terms |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Record last update timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AR-001 (Customer) | belongs-to | N:1 | Invoice belongs to a customer |
| CON-AR-003 (InvoiceLineItem) | has-many | 1:N | Invoice contains line items |
| CON-AR-005 (PaymentApplication) | has-many | 1:N | Invoice has payment applications |
| CON-AR-009 (InvoiceCreated) | triggers | 1:1 | Invoice creation emits event |

## Invariants

- INV-FIN-001: Invoice total must balance (subtotal + tax = total_amount).
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-CROSS-003: Invoice has a globally unique identifier (UUID v7).

## Business Rules

- BR-003: Payment terms are defined per customer and determine the due_date.

## Events

- InvoiceCreated (CON-AR-009)
- InvoiceSent
- InvoicePaid
- InvoiceOverdue (CON-AR-012)
- InvoiceVoided

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Event Catalog](../../constitution/DOMAIN.md#7-event-catalog)
