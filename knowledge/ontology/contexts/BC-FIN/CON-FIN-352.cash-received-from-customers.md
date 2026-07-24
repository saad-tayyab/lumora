---
id: CON-FIN-352
name: Cash Received from Customers
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

# Cash Received from Customers

## Definition

The actual cash collected from customers during the period, computed by adjusting sales revenue for changes in accounts receivable. An increase in accounts receivable means sales exceeded cash collections; a decrease means cash collections exceeded sales.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| sales | decimal | Sales revenue from the income statement |
| change_in_accounts_receivable | decimal | Increase (subtract) or decrease (add) in accounts receivable |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
