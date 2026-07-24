---
id: CON-CASH-009
name: TransferCompleted
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
  - completion
---

# TransferCompleted

## Definition
A domain event emitted when a bank transfer has been successfully completed. This event signals that funds have moved and the transfer status should be updated. Used to trigger downstream processes such as balance updates and financial reporting.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| event_id | UUID v7 | yes | Unique event identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| transfer_id | UUID v7 | yes | Reference to the completed BankTransfer |
| source_account_id | UUID v7 | yes | Source bank account |
| destination_account_id | UUID v7 | yes | Destination account |
| amount | numeric(19,4) | yes | Transfer amount |
| currency_code | string(3) | yes | ISO 4217 currency code |
| completed_at | timestamp | yes | When the transfer completed |
| reference_number | string(50) | no | External reference number |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-002 (BankTransfer) | triggers | 1:1 | Event for this transfer |

## Invariants
- INV-CROSS-003: Event must have a globally unique identifier (UUID v7).
- INV-CASH-024: Completed event must reference a transfer that was in Processing or Pending status.

## Business Rules
- INV-CROSS-002: Cross-context communication happens through domain events only.

## Events
- This is an event (does not emit other events)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#44-cross-context-invariants)
