---
id: CON-FIN-314
name: Partnership Liquidation
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

# Partnership Liquidation

## Definition

The process of winding up a partnership's business by selling all noncash assets, paying liabilities, and distributing remaining cash to partners based on their capital account balances.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| noncash_assets | asset[] | All noncash assets to be sold |
| liabilities | liability[] | All liabilities to be paid |
| partner_capital_balances | balance[] | Capital balances of all partners |
| income_sharing_ratio | ratio | The ratio used to divide gains and losses on realization |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
