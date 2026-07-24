---
id: CON-FIN-170
name: Sales-Related Transaction
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Sales-Related Transaction

## Definition

A business transaction involving the sale of merchandise to customers, including sales on account, cash sales, credit card sales, and sales with sales tax.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer | string | Buyer of merchandise |
| sales_amount | decimal | Total sales price |
| cost_of_goods_sold | decimal | Cost of merchandise sold |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
