---
id: CON-FIN-218
name: Bad Debt Expense
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

# Bad Debt Expense

## Definition

An expense account recognizing the estimated uncollectible accounts receivable for a period. Recorded as a debit in the adjusting entry.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | Money | Estimated uncollectible amount for the period |
| method | String | Estimation method used (percent of sales or analysis of receivables) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
