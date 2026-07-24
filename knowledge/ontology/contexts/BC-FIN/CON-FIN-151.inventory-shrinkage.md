---
id: CON-FIN-151
name: Inventory Shrinkage
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

# Inventory Shrinkage

## Definition

The difference between the inventory quantity shown in the accounting records and the actual physical count. Under the perpetual system, it is recorded as a debit to Cost of Goods Sold and credit to Inventory. Under the periodic system, shrinkage is indirectly included in the cost of goods sold computation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| physical_count | decimal | Actual inventory on hand from physical count |
| book_balance | decimal | Inventory balance in accounting records |
| shrinkage_amount | decimal | Difference between physical count and book balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
