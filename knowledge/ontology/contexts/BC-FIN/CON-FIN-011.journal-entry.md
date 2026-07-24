---
id: CON-FIN-011
name: Journal Entry
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Journal Entry

## Definition

A recording of a transaction in the journal. Includes the date, accounts to be debited and credited, amounts, and a brief description. Total debits must equal total credits.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date | date | Date of the transaction |
| debit_account | string | Account to be debited |
| debit_amount | money | Amount to debit |
| credit_account | string | Account to be credited |
| credit_amount | money | Amount to credit |
| description | string | Brief explanation |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-085 (Account) | uses | N:M | A journal entry debits and credits multiple accounts |
| CON-FIN-012 (General Journal) | belongs-to | N:1 | Every journal entry is recorded in the general journal |
| CON-FIN-013 (General Ledger) | uses | N:M | Journal entries are posted to update the general ledger |
| CON-FIN-020 (Adjusting Entry) | extends | 1:1 | Adjusting entries are a specialized type of journal entry |
| CON-FIN-021 (Closing Entry) | extends | 1:1 | Closing entries are a specialized type of journal entry |
| CON-FIN-007 (Business Transaction) | triggers | N:M | A business transaction triggers the creation of journal entries |

## Invariants

- INV-FIN-001: Every journal entry must balance (total debits = total credits).
- INV-FIN-003: Every financial transaction must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-AUTH-001: Every action must be attributable to a user or system process.

## Business Rules

- BR-003: Double-entry bookkeeping — every transaction affects at least two accounts.
- BR-044: Double-entry equality — total debits must equal total credits.
- BR-045: Posting preserves journal entry reference.
- BR-051: Journal before ledger — transactions are recorded in the journal before posting to the ledger.
- BR-065: Adjusting entries are made at period end only.

## Events

- JournalEntryCreated
- JournalEntryPosted
- JournalEntryReversed

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
