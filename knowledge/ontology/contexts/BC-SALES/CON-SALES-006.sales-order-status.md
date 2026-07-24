---
id: CON-SALES-006
name: SalesOrderStatus
context: BC-SALES
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - sales
  - order
  - status
  - value-object
---

# SalesOrderStatus

## Definition

An immutable value object representing the current state of a sales order. Status transitions follow a defined workflow: Draft → Confirmed → Processing → Shipped → Delivered. Orders may also be Cancelled from any non-terminal state.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| value | enum | yes | Current status value |
| changed_at | timestamp | yes | Timestamp of status change |
| changed_by | UUID v7 | yes | User who changed the status |
| reason | string(500) | no | Reason for status change (required for cancellation) |

## Allowed Values

| Value | Description | Terminal |
|-------|-------------|----------|
| Draft | Order created but not yet confirmed | No |
| Confirmed | Order confirmed by customer or sales rep | No |
| Processing | Order is being prepared for shipment | No |
| Shipped | Order has been shipped | No |
| Delivered | Order has been delivered to customer | Yes |
| Cancelled | Order has been cancelled | Yes |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-SALES-002 (SalesOrder) | used-by | N:1 | Status belongs to a sales order |

## Invariants

- Status transitions must follow the defined workflow.
- Cancelled orders cannot be reactivated.
- Delivered orders cannot transition to any other state.

## References

- [Domain Constitution — BC-SALES](../../../../knowledge/constitution/DOMAIN.md)
