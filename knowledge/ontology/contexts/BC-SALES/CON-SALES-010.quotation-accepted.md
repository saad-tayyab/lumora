---
id: CON-SALES-010
name: QuotationAccepted
context: BC-SALES
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - quotation
  - event
  - domain-event
---

# QuotationAccepted

## Definition

A domain event emitted when a customer accepts a quotation. This event may trigger the conversion of the quotation into a sales order and notifies relevant contexts of the acceptance.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| occurred_at | timestamp | yes | When the event occurred |
| quotation_id | UUID v7 | yes | ID of the accepted quotation |
| customer_id | UUID v7 | yes | ID of the customer who accepted |
| total | money | yes | Quotation total amount |
| accepted_by | UUID v7 | yes | User who recorded the acceptance |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-004 (Quotation) | caused-by | N:1 | Event is caused by quotation acceptance |
| CON-SALES-001 (Customer) | references | N:1 | Event references the customer |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process.
- INV-CROSS-002: Cross-context communication happens through domain events only.

## Events

- Triggers creation of SalesOrder (if auto-conversion is enabled)

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
