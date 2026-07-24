---
id: CON-FIN-501
name: Cash Receipts Schedule
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

# Cash Receipts Schedule

## Definition

A supporting schedule for the cash budget that estimates cash collections from sales based on collection patterns (cash sales percentage and credit collection timing).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_sales_percentage | number | Percentage of sales collected immediately in cash |
| credit_collection_pattern | object | Percentage of credit sales collected in each subsequent month |
| beginning_accounts_receivable | number | Outstanding receivables at period start |
| total_cash_receipts | number | Total cash expected to be collected |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
