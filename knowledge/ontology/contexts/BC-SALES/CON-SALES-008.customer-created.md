---
id: CON-SALES-008
name: CustomerCreated
context: BC-SALES
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - customer
  - event
  - domain-event
---

# CustomerCreated

## Definition

A domain event emitted when a new customer record is created in the system. This event notifies other bounded contexts (e.g., BC-AR for accounts receivable, BC-FIN for reporting) that a new customer exists.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| occurred_at | timestamp | yes | When the event occurred |
| customer_id | UUID v7 | yes | ID of the newly created customer |
| name | string(200) | yes | Customer name |
| email | string(255) | no | Customer email |
| created_by | UUID v7 | yes | User who created the customer |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-001 (Customer) | caused-by | N:1 | Event is caused by customer creation |

## Invariants

- INV-AUTH-001: Every action must be attributable to a user or system process (created_by is required).
- INV-CROSS-002: Cross-context communication happens through domain events only.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
- [Event Catalog — EVT-005](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
