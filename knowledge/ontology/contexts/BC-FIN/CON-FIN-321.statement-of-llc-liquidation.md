---
id: CON-FIN-321
name: Statement of LLC Liquidation
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

# Statement of LLC Liquidation

## Definition

The LLC equivalent of a statement of partnership liquidation, showing the same liquidation steps but using 'Member Equity' account titles.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash | numeric[] | Cash balance at each step |
| noncash_assets | numeric[] | Noncash assets at each step |
| liabilities | numeric[] | Liabilities at each step |
| member_equity | numeric[][] | Each member's equity balance at each step |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
