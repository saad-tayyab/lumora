---
id: CON-FIN-020
name: Adjusting Entry
context: BC-FIN
type: command
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Adjusting Entry

## Definition

A journal entry made at the end of an accounting period to assign revenues to the period in which they are earned and expenses to the period in which they are incurred, ensuring compliance with the accrual basis of accounting.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| debit_account | string | Account to be debited |
| credit_account | string | Account to be credited |
| amount | decimal | Monetary amount of the adjustment |
| period_end_date | date | Accounting period end date |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
