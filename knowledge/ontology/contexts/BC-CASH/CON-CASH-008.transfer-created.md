---
id: CON-CASH-008
name: TransferCreated
context: BC-CASH
type: event
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - event
  - transfer
---

# TransferCreated

## Definition
A domain event emitted when a new bank transfer is initiated. This event signals that a transfer has been created and is awaiting processing. Used for cross-context communication to trigger downstream processes such as journal entry creation and notifications.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| transfer_id | UUID v7 | yes | Reference to the created BankTransfer |
| source_account_id | UUID v7 | yes | Source bank account |
| destination_account_id | UUID v7 | yes | Destination account |
| amount | numeric(19,4) | yes | Transfer amount |
| currency_code | string(3) | yes | ISO 4217 currency code |
| transfer_type | string(20) | yes | Type of transfer |
| initiated_by | UUID v7 | yes | User who created the transfer |
| occurred_at | timestamp | yes | When the event occurred |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-002 (BankTransfer) | triggers | 1:1 | Event for this transfer |

## Invariants
- INV-CROSS-003: Event must have a globally unique identifier (UUID v7).
- INV-CASH-023: Event payload must include all required fields for downstream consumers.

## Business Rules
- INV-CROSS-002: Cross-context communication happens through domain events only.

## Events
- This is an event (does not emit other events)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#44-cross-context-invariants)
