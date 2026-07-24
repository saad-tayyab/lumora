---
id: CON-FIN-311
name: Statement of Partnership Equity
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

# Statement of Partnership Equity

## Definition

A financial statement showing the changes in each partner's capital account during the period, including beginning balances, investments, net income, withdrawals, and ending balances.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| period | date_range | The accounting period covered |
| partner_balances | balance_row[] | Beginning balance, investments, net income, withdrawals, ending balance for each partner |
| total_equity | numeric | Total partners' equity at beginning and end of period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
