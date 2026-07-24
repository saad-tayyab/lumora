---
id: CON-FIN-309
name: Interest Allowance
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

# Interest Allowance

## Definition

An allocation of partnership income to partners based on their capital balances, calculated as a percentage of each partner's beginning capital balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partner_name | string | The partner receiving the allowance |
| capital_balance | numeric | The partner's capital balance used for computation |
| interest_rate | percentage | The agreed-upon interest rate |
| allowance_amount | numeric | Capital balance multiplied by interest rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
