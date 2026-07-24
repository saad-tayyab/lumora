---
id: CON-FIN-085
name: Account
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

# Account

## Definition

An individual recordkeeping device used to record increases and decreases in a specific asset, liability, owner's equity, revenue, or expense. In its simplest form (T account), it has three parts: a title, a debit (left) side, and a credit (right) side.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| title | string | The name of the accounting element recorded in the account |
| debit_side | money | Left side for recording debits |
| credit_side | money | Right side for recording credits |
| balance | money | The excess of debits over credits or credits over debits |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-056 (Chart of Accounts) | belongs-to | N:1 | Every account belongs to exactly one chart of accounts |
| CON-FIN-002 (Asset) | extends | 1:1 | Asset accounts extend the base Account concept |
| CON-FIN-003 (Liability) | extends | 1:1 | Liability accounts extend the base Account concept |
| CON-FIN-005 (Revenue) | extends | 1:1 | Revenue accounts extend the base Account concept |
| CON-FIN-006 (Expense) | extends | 1:1 | Expense accounts extend the base Account concept |
| CON-FIN-008 (T-Account) | extends | 1:1 | T-account is the visual representation format of an account |
| CON-FIN-108 (Contra Account) | extends | 1:1 | Contra accounts offset the balance of a related account |
| CON-FIN-013 (General Ledger) | contained-in | N:1 | Accounts are contained within the general ledger |

## Invariants

- INV-FIN-001: Account balances must be consistent with recorded debits and credits.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).
- INV-CROSS-003: Every entity must have a globally unique identifier (UUID v7).
- INV-AUTH-003: Soft deletion is mandatory for all user-facing entities.

## Business Rules

- BR-002: Rules of debit and credit — debits increase assets/expenses, credits increase liabilities/equity/revenue.
- BR-050: Normal balance convention — each account type has a normal debit or credit balance.
- BR-064: Contra account balance is opposite to related account.
- BR-088: Permanent vs. temporary accounts distinction — permanent accounts carry balances forward, temporary accounts close at period end.

## Events

- AccountCreated
- AccountUpdated
- AccountDeactivated
- BalanceChanged

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
