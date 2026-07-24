---
id: CON-FIN-013
name: General Ledger
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# General Ledger

## Definition

The book of final entry where journal entries are posted to individual accounts, providing the balances for each account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts | list | All accounts of the business |
| account_balances | map | Current balance of each account |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-085 (Account) | has-many | 1:N | The general ledger contains all accounts with their balances |
| CON-FIN-011 (Journal Entry) | uses | N:M | The general ledger is updated by posting journal entries |
| CON-FIN-012 (General Journal) | uses | N:1 | Journal entries flow from the general journal to the general ledger |
| CON-FIN-014 (Adjusted Trial Balance) | produces | 1:1 | The general ledger produces the adjusted trial balance after adjustments |
| CON-FIN-056 (Chart of Accounts) | implements | N:1 | The general ledger implements the chart of accounts structure |

## Invariants

- INV-FIN-001: Every journal entry posted to the general ledger must balance.
- INV-FIN-003: Every state change in the general ledger must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- BR-003: Double-entry bookkeeping — every posting affects at least two accounts.
- BR-004: Trial balance equality — total debits in the ledger must equal total credits.
- BR-045: Posting preserves journal entry reference — every ledger entry traces back to its source journal entry.
- BR-051: Journal before ledger — transactions are journalized before being posted to the ledger.
- BR-104: Subsidiary ledger must match controlling account.

## Events

- LedgerUpdated
- AccountBalanceChanged
- PeriodClosed
- TrialBalanceGenerated

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
