---
id: CON-CASH-004
name: ReconciliationEntry
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
  - reconciliation
  - matching
---

# ReconciliationEntry

## Definition
An entity representing a single transaction line from a bank statement that needs to be matched against internal financial records. Each entry is either automatically or manually reconciled with a corresponding journal entry or transfer.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| statement_id | UUID v7 | yes | Reference to BankStatement |
| bank_account_id | UUID v7 | yes | Reference to BankAccount |
| transaction_date | date | yes | Date of the bank transaction |
| description | string(255) | yes | Transaction description from bank |
| amount | numeric(19,4) | yes | Transaction amount (positive for credit, negative for debit) |
| balance_after | numeric(19,4) | no | Account balance after this transaction |
| transaction_type | enum | yes | Credit, Debit, Transfer, Fee, Interest |
| reference_number | string(50) | no | Bank reference number |
| reconciliation_status | enum | yes | Unmatched, AutoMatched, ManuallyMatched, Excluded, Disputed |
| matched_entity_id | UUID v7 | no | ID of matched internal record |
| matched_entity_type | string(50) | no | Type of matched entity (JournalEntry, Transfer, etc.) |
| match_confidence | numeric(5,4) | no | Auto-match confidence score (0.0 to 1.0) |
| reconciled_by | UUID v7 | no | User who performed manual match |
| reconciled_at | timestamp | no | Timestamp of reconciliation |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-003 (BankStatement) | belongs-to | N:1 | Entry belongs to a statement |
| CON-CASH-001 (BankAccount) | belongs-to | N:1 | Entry for this account |
| CON-CASH-005 (ReconciliationMatch) | has-many | 1:N | Matches for this entry |

## Invariants
- INV-CASH-010: Reconciliation entry amount must have decimal precision.
- INV-CASH-011: Matched entity must exist in the referenced entity type.
- INV-CASH-012: Match confidence must be between 0.0 and 1.0.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance — this entity stores the reconciliation status.

## Events
- CON-CASH-014 (ReconciliationCompleted) — emitted when all entries in a statement are reconciled

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#42-inventory-invariants)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
