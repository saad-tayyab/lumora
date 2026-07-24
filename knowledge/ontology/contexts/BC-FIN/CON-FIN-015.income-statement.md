---
id: CON-FIN-015
name: Income Statement
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

# Income Statement

## Definition

A summary of the revenue and expenses for a specific period of time, such as a month or a year. The excess of revenue over expenses is net income; if expenses exceed revenue, it is a net loss.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue | money | Total revenue earned during the period |
| expenses | money | Total expenses incurred during the period |
| net_income | money | Revenue minus expenses (positive = net income, negative = net loss) |
| period | date_range | Time period covered |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-FIN-014 (Adjusted Trial Balance) | uses | N:1 | Income statement is prepared from the adjusted trial balance |
| CON-FIN-005 (Revenue) | summarizes | N:M | Summarizes all revenue accounts for the period |
| CON-FIN-006 (Expense) | summarizes | N:M | Summarizes all expense accounts for the period |
| CON-FIN-016 (Statement of Owner's Equity) | feeds | 1:1 | Net income feeds into the statement of owner's equity |
| CON-FIN-017 (Consolidated Balance Sheet) | feeds | 1:1 | Net income feeds into retained earnings on the balance sheet |
| CON-FIN-018 (Statement of Cash Flows) | feeds | 1:1 | Net income is the starting point for operating cash flows (indirect method) |
| CON-FIN-055 (Fiscal Year) | belongs-to | N:1 | Income statement covers a specific fiscal period |

## Invariants

- INV-FIN-001: Revenue and expense amounts must be properly classified and balanced.
- INV-FIN-003: Every financial statement must have an audit trail.
- INV-FIN-004: Currency amounts must be stored with decimal precision (numeric, not float).

## Business Rules

- BR-005: Revenue recognition principle — revenue is recognized when earned.
- BR-006: Matching principle — expenses are matched to the revenues they help generate.
- BR-026: Financial statement preparation order — income statement is prepared before the balance sheet.
- BR-035: Expense ordering on income statement — expenses are listed by function or magnitude.
- BR-114: Multiple-step income statement classification — separates operating from non-operating items.

## Events

- IncomeStatementGenerated
- NetIncomeCalculated
- PeriodReported

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Domain Invariants](../../constitution/DOMAIN.md#4-domain-invariants)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
