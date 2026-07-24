---
id: CON-FIN-319
name: Statement of Partnership Liquidation
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

# Statement of Partnership Liquidation

## Definition

A formal report summarizing the liquidation process, showing the sale of assets, division of gain or loss, payment of liabilities, and distribution of cash to partners.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash | numeric[] | Cash balance at each step |
| noncash_assets | numeric[] | Noncash assets at each step |
| liabilities | numeric[] | Liabilities at each step |
| partner_capital | numeric[][] | Each partner's capital balance at each step |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
