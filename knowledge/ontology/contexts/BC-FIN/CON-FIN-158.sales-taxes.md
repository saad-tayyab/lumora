---
id: CON-FIN-158
name: Sales Taxes
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

# Sales Taxes

## Definition

Taxes levied by states on sales of merchandise. The seller collects the tax at the time of sale and remits it to the taxing authority.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| collection | entry | Debit Cash or Accounts Receivable, credit Sales and Sales Tax Payable |
| payment | entry | Debit Sales Tax Payable, credit Cash |
| liability | string | Incurred when the sale is made |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
