---
id: CON-FIN-227
name: Days' Sales in Receivables
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

# Days' Sales in Receivables

## Definition

An estimate of the average time (in days) that accounts receivable have been outstanding, computed as Average Accounts Receivable divided by Average Daily Sales.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| average_accounts_receivable | currency | Average accounts receivable balance |
| average_daily_sales | currency | Sales / 365 days |
| days | integer | Estimated days receivables outstanding |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
