---
id: CON-FIN-014
name: Adjusted Trial Balance
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Adjusted Trial Balance

## Definition

A trial balance prepared after adjusting entries have been posted, used to verify equality of debits and credits before preparing financial statements.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts | list | All accounts with adjusted balances |
| total_debits | Money | Sum of all debit balances |
| total_credits | Money | Sum of all credit balances |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-013 (General Ledger) | uses | N:1 | Adjusted trial balance is prepared from general ledger balances after adjustments |
| CON-FIN-020 (Adjusting Entry) | uses | N:M | Adjusted trial balance incorporates all adjusting entries |
| CON-FIN-015 (Income Statement) | produces | 1:1 | Income statement is prepared from the adjusted trial balance |
| CON-FIN-017 (Consolidated Balance Sheet) | produces | 1:1 | Balance sheet is prepared from the adjusted trial balance |
| CON-FIN-016 (Statement of Owner's Equity) | produces | 1:1 | Statement of owner's equity is prepared from the adjusted trial balance |
| CON-FIN-085 (Account) | summarizes | N:M | Summarizes all account balances after adjustments |

## Invariants

- INV-FIN-001: Total debits must equal total credits in the adjusted trial balance.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- BR-004: Trial balance equality — debits must equal credits after adjustments.
- BR-020: Adjusting entries must balance.
- BR-065: Adjusting entries are made at period end only.
- BR-070: Adjusted trial balance precedes financial statements.
- BR-094: Spreadsheet column equality — worksheet totals must match.

## Events

- AdjustedTrialBalancePrepared
- AdjustmentVerified
- FinancialStatementsReady

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
