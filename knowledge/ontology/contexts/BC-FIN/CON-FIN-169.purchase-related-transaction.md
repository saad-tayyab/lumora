---
id: CON-FIN-169
name: Purchase-Related Transaction
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

# Purchase-Related Transaction

## Definition

A business transaction involving the acquisition of merchandise inventory, including purchases on account, purchase returns, purchase discounts, and freight charges.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| vendor | string | Supplier from whom merchandise is purchased |
| amount | decimal | Invoice amount of merchandise |
| terms | string | Credit terms and discount conditions |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
