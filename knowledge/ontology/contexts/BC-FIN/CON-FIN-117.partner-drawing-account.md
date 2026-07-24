---
id: CON-FIN-117
name: Partner Drawing Account
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

# Partner Drawing Account

## Definition

A temporary account used to record withdrawals made by a partner during the accounting period, closed to the partner's capital account at period end.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partner_name | string | The name of the partner |
| total_withdrawals | numeric | Total amounts withdrawn during the period |
| debit_balance | numeric | The normal debit balance of the drawing account |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
