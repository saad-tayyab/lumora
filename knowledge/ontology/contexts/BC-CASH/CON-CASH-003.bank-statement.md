---
id: CON-CASH-003
name: BankStatement
context: BC-CASH
type: entity
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - statement
  - import
---

# BankStatement

## Definition
An entity representing an imported bank statement containing transaction data from a financial institution. Statements are imported via bank connections or manual upload and serve as the source of truth for reconciliation.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| bank_account_id | UUID v7 | yes | Reference to the BankAccount |
| statement_date | date | yes | Date of the statement |
| period_start | date | yes | Start date of statement period |
| period_end | date | yes | End date of statement period |
| opening_balance | numeric(19,4) | yes | Balance at period start |
| closing_balance | numeric(19,4) | yes | Balance at period end |
| import_source | enum | yes | API, CSV, OFX, Manual |
| import_status | enum | yes | Pending, Processing, Completed, Failed |
| file_reference | string(255) | no | Reference to imported file in storage |
| transaction_count | integer | yes | Number of transactions in statement |
| reconciled_count | integer | no | Number of reconciled transactions |
| imported_by | UUID v7 | yes | User who imported the statement |
| imported_at | timestamp | yes | Timestamp of import |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-001 (BankAccount) | belongs-to | N:1 | Statement for this account |
| CON-CASH-004 (ReconciliationEntry) | has-many | 1:N | Entries to reconcile |
| CON-CASH-010 (StatementImported) | triggers | 1:1 | Event emitted on import |

## Invariants
- INV-CASH-008: Statement period end must be after period start.
- INV-CASH-009: Closing balance must equal opening balance plus net transactions.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance (statements are reconciled against ledger).

## Events
- CON-CASH-010 (StatementImported)
- CON-CASH-013 (ReconcileAccount) — command to reconcile statement entries

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#42-inventory-invariants)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
