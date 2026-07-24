---
id: CON-SALES-009
name: SalesOrderCreated
context: BC-SALES
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - order
  - event
  - domain-event
---

# SalesOrderCreated

## Definition

A domain event emitted when a new sales order is created. This event triggers downstream processes such as inventory allocation, credit checks, and potentially quotation conversion.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| occurred_at | timestamp | yes | When the event occurred |
| sales_order_id | UUID v7 | yes | ID of the newly created sales order |
| customer_id | UUID v7 | yes | ID of the customer placing the order |
| total | money | yes | Order total amount |
| currency | string(3) | yes | ISO 4217 currency code |
| quotation_id | UUID v7 | no | Source quotation ID if converted from quotation |
| created_by | UUID v7 | yes | User who created the order |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-002 (SalesOrder) | caused-by | N:1 | Event is caused by sales order creation |
| CON-SALES-001 (Customer) | references | N:1 | Event references the customer |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- INV-CROSS-002: Cross-context communication happens through domain events only.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
