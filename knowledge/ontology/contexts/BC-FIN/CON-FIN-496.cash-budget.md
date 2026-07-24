---
id: CON-FIN-496
name: Cash Budget
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

# Cash Budget

## Definition

A budget that projects cash receipts and cash payments to determine the expected cash balance at the end of each period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| beginning_cash_balance | number | Cash available at period start |
| cash_receipts | number | Expected cash collections from sales |
| cash_disbursements | number | Expected cash payments for expenses |
| minimum_cash_balance | number | Desired minimum cash balance to maintain |
| ending_cash_balance | number | Projected cash balance at period end |
| financing_needed | number | Amount of borrowing needed if cash falls below minimum |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
