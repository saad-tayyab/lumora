---
id: CON-FIN-116
name: End-of-Period Spreadsheet
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

# End-of-Period Spreadsheet

## Definition

A working paper used to summarize the unadjusted trial balance, adjustments, adjusted trial balance, and the distribution of amounts to the income statement and balance sheet columns. It is optional but aids in preparing financial statements.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| unadjusted_trial_balance | columns | Unadjusted debit and credit balances |
| adjustments | columns | Adjusting entry debits and credits |
| adjusted_trial_balance | columns | Adjusted debit and credit balances |
| income_statement_columns | columns | Revenues and expenses extended from adjusted trial balance |
| balance_sheet_columns | columns | Assets, liabilities, and equity extended from adjusted trial balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
