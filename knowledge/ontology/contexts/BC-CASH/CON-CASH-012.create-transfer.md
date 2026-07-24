---
id: CON-CASH-012
name: CreateTransfer
context: BC-CASH
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - command
  - transfer
---

# CreateTransfer

## Definition
A command representing the intent to create a new bank transfer. Initiates the transfer workflow including validation, balance checks, and transfer execution. The command carries all necessary data to create and process a transfer.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| command_id | UUID v7 | yes | Unique command identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| source_account_id | UUID v7 | yes | Source bank account |
| destination_account_id | UUID v7 | yes | Destination account |
| amount | numeric(19,4) | yes | Transfer amount (must be > 0) |
| currency_code | string(3) | yes | ISO 4217 currency code |
| transfer_type | enum | yes | Internal, External, Wire, ACH, Check |
| description | string(255) | no | Transfer description/memo |
| scheduled_date | date | no | Date for future-dated transfers |
| idempotency_key | string(100) | yes | Prevents duplicate transfers |
| requested_by | UUID v7 | yes | User requesting the transfer |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-002 (BankTransfer) | creates | 1:1 | Command creates this transfer |
| CON-CASH-008 (TransferCreated) | triggers | 1:1 | Event emitted on success |

## Invariants
- INV-CASH-027: Command must include all required fields for transfer creation.
- INV-CASH-028: Idempotency key must be unique per tenant.
- INV-CASH-029: Amount must be greater than zero.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance — transfers feed reconciliation.

## Events
- CON-CASH-008 (TransferCreated) — emitted when command is processed

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#7-event-catalog)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
