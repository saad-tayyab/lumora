---
id: CON-FIN-056
name: Chart of Accounts
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

# Chart of Accounts

## Definition

A complete listing of all accounts used by a business, arranged in order of account numbers. The first digit indicates the major classification (1=assets, 2=liabilities, 3=equity, 4=revenue, 5=expenses), the second digit indicates subclassification, and the third digit identifies the specific account.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account_number | string | Three-digit code identifying each account |
| major_classification | string | First digit indicating account type |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-085 (Account) | has-many | 1:N | A chart of accounts contains multiple accounts organized by classification |
| CON-FIN-002 (Asset) | classifies | 1:N | First digit 1 classifies asset accounts |
| CON-FIN-003 (Liability) | classifies | 1:N | First digit 2 classifies liability accounts |
| CON-FIN-004 (Owner's Equity) | classifies | 1:N | First digit 3 classifies equity accounts |
| CON-FIN-005 (Revenue) | classifies | 1:N | First digit 4 classifies revenue accounts |
| CON-FIN-006 (Expense) | classifies | 1:N | First digit 5 classifies expense accounts |
| CON-FIN-055 (Fiscal Year) | belongs-to | N:1 | Each chart of accounts belongs to a fiscal year configuration |

## Invariants

- INV-FIN-005: Chart of accounts follows a hierarchical structure with strict typing (Asset, Liability, Equity, Revenue, Expense).
- INV-CROSS-001: No bounded context may directly access another context's database tables.
- INV-AUTH-003: Soft deletion is mandatory for all user-facing entities.

## Business Rules

- BR-050: Normal balance convention — accounts have a normal debit or credit balance based on type.
- BR-090: Balance sheet account classification — accounts are classified as asset, liability, or equity.
- BR-017: Consistency in financial reporting — the chart of accounts structure must remain consistent across periods.

## Events

- ChartOfAccountsCreated
- AccountAdded
- AccountDeactivated
- AccountReclassified

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
