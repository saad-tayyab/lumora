---
id: CON-FIN-384
name: Finished Goods Inventory
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

# Finished Goods Inventory

## Definition

An inventory account that accumulates the costs of completed jobs that have not yet been sold. Represents completed production awaiting sale.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| balance | decimal | Total cost of completed but unsold jobs |
| units | integer | Number of units completed and ready for sale |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
