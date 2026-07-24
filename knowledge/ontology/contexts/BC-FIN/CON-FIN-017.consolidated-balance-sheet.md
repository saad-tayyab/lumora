---
id: CON-FIN-017
name: Consolidated Balance Sheet
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

# Consolidated Balance Sheet

## Definition

A financial statement that presents a company's assets, liabilities, and shareholders' equity at a specific point in time, combining the financial position of the parent company and its subsidiaries.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| assets | Map<String, Money> | Resources owned by the company including current assets, PP&E, intangibles, and goodwill |
| liabilities | Map<String, Money> | Obligations including current liabilities, long-term debt, and deferred taxes |
| shareholders_equity | Money | Residual interest: common stock, capital in excess of stated value, AOCI, retained earnings |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-014 (Adjusted Trial Balance) | uses | N:1 | Balance sheet is prepared from the adjusted trial balance |
| CON-FIN-001 (Accounting Equation) | enforces | 1:1 | Balance sheet enforces Assets = Liabilities + Equity |
| CON-FIN-002 (Asset) | summarizes | N:M | Summarizes all asset accounts |
| CON-FIN-003 (Liability) | summarizes | N:M | Summarizes all liability accounts |
| CON-FIN-004 (Owner's Equity) | summarizes | N:M | Summarizes all equity accounts |
| CON-FIN-015 (Income Statement) | uses | N:1 | Net income from income statement feeds retained earnings |
| CON-FIN-055 (Fiscal Year) | belongs-to | N:1 | Balance sheet is reported at a specific date within the fiscal year |

## Invariants

- INV-FIN-001: Assets must equal liabilities plus shareholders' equity (accounting equation).
- INV-FIN-003: Every financial statement must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- BR-026: Financial statement preparation order — balance sheet is prepared after the income statement.
- BR-084: Balance sheet date reporting — balance sheet reports financial position at a specific point in time.
- BR-036: Accounting equation balance check — assets must equal liabilities plus equity.
- BR-114: Multiple-step income statement classification — asset and liability classifications must be consistent.

## Events

- BalanceSheetGenerated
- FinancialPositionReported
- PeriodClosed

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
