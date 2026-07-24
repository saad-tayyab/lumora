---
id: CON-FIN-139
name: Chart of Accounts for Retail Business
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

# Chart of Accounts for Retail Business

## Definition

A chart of accounts that includes additional accounts for merchandising transactions such as Inventory, Estimated Returns Inventory, Sales, Cost of Goods Sold, Customer Refunds Payable, and Estimated Coupons Payable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account_numbering | three_digit | First digit = major classification, second = subclassification, third = specific account |
| merchandising_accounts | list | Inventory, COGS, Sales, Customer Refunds Payable, etc. |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
