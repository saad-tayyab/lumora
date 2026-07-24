---
id: CON-SALES-002
name: SalesOrder
context: BC-SALES
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - order
  - core
---

# SalesOrder

## Definition

An aggregate root representing a customer's commitment to purchase goods or services. A sales order contains line items, pricing, and status tracking. It is the central document in the sales process and triggers downstream activities such as inventory allocation, fulfillment, and invoicing.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| order_number | string(50) | yes | Human-readable order number (e.g., "SO-2026-0001") |
| customer_id | UUID v7 | yes | Reference to Customer (CON-SALES-001) |
| status | enum | yes | Draft, Confirmed, Processing, Shipped, Delivered, Cancelled |
| order_date | date | yes | Date the order was placed |
| expected_delivery_date | date | no | Expected delivery date |
| subtotal | money | yes | Sum of line item amounts before tax/discount |
| discount_amount | money | no | Total discount applied |
| tax_amount | money | yes | Total tax applied |
| total | money | yes | Final order total |
| currency | string(3) | yes | ISO 4217 currency code |
| notes | text | no | Internal or customer-facing notes |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-001 (Customer) | belongs-to | N:1 | Order belongs to a customer |
| CON-SALES-003 (SalesOrderLineItem) | has-many | 1:N | Order contains many line items |
| CON-SALES-006 (SalesOrderStatus) | uses | 1:1 | Order has a status value object |

## Invariants

- INV-CROSS-003: SalesOrder ID is a globally unique UUID v7.
- INV-CROSS-001: No direct access to other context's database tables.
- INV-CROSS-002: Cross-context communication happens through domain events only.

## Business Rules

- BR-007: Quotations expire after configurable days (when order originates from a quotation).

## Events

- SalesOrderCreated
- SalesOrderConfirmed
- SalesOrderShipped
- SalesOrderDelivered
- SalesOrderCancelled

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
- [Glossary — Sales Order](../../../../knowledge/glossary/)
