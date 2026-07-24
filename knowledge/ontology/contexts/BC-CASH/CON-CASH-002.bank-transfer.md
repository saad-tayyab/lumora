---
id: CON-CASH-002
name: BankTransfer
context: BC-CASH
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - transfer
  - payment
---

# BankTransfer

## Definition
An aggregate representing a movement of funds between bank accounts, either internally within the organization or externally to/from third parties. Tracks the full lifecycle of a transfer from initiation to completion.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| source_account_id | UUID v7 | yes | Reference to source BankAccount |
| destination_account_id | UUID v7 | yes | Reference to destination account |
| amount | numeric(19,4) | yes | Transfer amount in minor units |
| currency_code | string(3) | yes | ISO 4217 currency code |
| transfer_type | enum | yes | Internal, External, Wire, ACH, Check |
| status | enum | yes | Pending, Processing, Completed, Failed, Cancelled |
| reference_number | string(50) | no | External reference number |
| description | string(255) | no | Transfer description/memo |
| scheduled_date | date | no | Date for future-dated transfers |
| completed_at | timestamp | no | Timestamp of completion |
| failure_reason | string(255) | no | Reason if transfer failed |
| created_by | UUID v7 | yes | User who initiated the transfer |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |
| deleted_at | timestamp | no | Soft deletion timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-001 (BankAccount) | belongs-to | N:1 | Source account |
| CON-CASH-001 (BankAccount) | belongs-to | N:1 | Destination account |
| CON-CASH-006 (Currency) | uses | 1:1 | Currency of the transfer |
| CON-CASH-008 (TransferCreated) | triggers | 1:1 | Event emitted on creation |
| CON-CASH-009 (TransferCompleted) | triggers | 0:1 | Event emitted on completion |

## Invariants
- INV-CASH-004: Transfer amount must be greater than zero.
- INV-CASH-005: Source and destination accounts must be different.
- INV-CASH-006: Transfer status transitions must follow valid state machine.
- INV-CASH-007: Completed transfers cannot be modified or deleted.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance (transfers feed reconciliation).

## Events
- CON-CASH-008 (TransferCreated)
- CON-CASH-009 (TransferCompleted)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#42-inventory-invariants)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
