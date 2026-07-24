---
id: CON-CASH-001
name: BankAccount
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
  - banking
  - aggregate-root
---

# BankAccount

## Definition
An aggregate root representing a financial account held at a bank or financial institution. This is the primary entity for tracking cash positions across all banking relationships.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| bank_name | string(100) | yes | Name of the financial institution |
| account_name | string(100) | yes | User-defined name for the account |
| account_number | string(50) | yes | Bank account number (encrypted) |
| routing_number | string(20) | no | Bank routing number |
| account_type | enum | yes | Checking, Savings, MoneyMarket, CreditLine |
| currency_code | string(3) | yes | ISO 4217 currency code |
| current_balance | numeric(19,4) | yes | Current ledger balance |
| available_balance | numeric(19,4) | yes | Available balance (may differ from current) |
| status | enum | yes | Active, Inactive, Frozen, Closed |
| is_default | boolean | no | Whether this is the default account |
| last_synced_at | timestamp | no | Last time bank connection was synced |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |
| deleted_at | timestamp | no | Soft deletion timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-006 (Currency) | uses | 1:1 | Account denominated in a single currency |
| CON-CASH-007 (BankConnection) | has-one | 1:1 | Optional connection to bank API |
| CON-CASH-002 (BankTransfer) | has-many | 1:N | Transfers from this account |
| CON-CASH-003 (BankStatement) | has-many | 1:N | Statements for this account |
| CON-CASH-004 (ReconciliationEntry) | has-many | 1:N | Reconciliation entries |

## Invariants
- INV-CASH-001: Bank account balance must be numeric with decimal precision (never floating point).
- INV-CASH-002: Account number must be encrypted at rest.
- INV-CASH-003: Soft deletion is mandatory (deleted_at field).
- INV-AUTH-001: Every action on this entity must be attributable to a user or system process.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance (applies to reconciliation of this account).

## Events
- CON-CASH-008 (TransferCreated) — emitted when a transfer originates from this account
- CON-CASH-009 (TransferCompleted) — emitted when a transfer involving this account completes
- CON-CASH-010 (StatementImported) — emitted when a statement is imported for this account

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#42-inventory-invariants)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
