---
id: CON-FIN-353
name: Cash Paid for Merchandise
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

# Cash Paid for Merchandise

## Definition

The actual cash paid for inventory purchases during the period, computed by adjusting cost of goods sold for changes in inventories and accounts payable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_of_goods_sold | decimal | COGS from the income statement |
| change_in_inventories | decimal | Increase (add) or decrease (subtract) in inventories |
| change_in_accounts_payable | decimal | Increase (subtract) or decrease (add) in accounts payable to merchandise creditors |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
