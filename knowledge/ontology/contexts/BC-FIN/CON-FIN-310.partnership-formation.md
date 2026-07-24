---
id: CON-FIN-310
name: Partnership Formation
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

# Partnership Formation

## Definition

The process of creating a partnership by recording the initial investments of each partner, with noncash assets recorded at agreed-upon current market values.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partner_name | string | The contributing partner's name |
| cash_invested | numeric | Cash contributed to the partnership |
| noncash_assets | asset[] | Noncash assets contributed at agreed-upon market values |
| liabilities_assumed | liability[] | Liabilities assumed by the partnership from the contributing partner |
| capital_credit | numeric | The partner's capital balance credited |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
