---
id: CON-FIN-409
name: Finished Goods Ledger
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

# Finished Goods Ledger

## Definition

The subsidiary ledger for the Finished Goods inventory account, containing records for each type of completed product.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| controls | string | Finished Goods control account |
| detail | string | Records per completed product type |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
