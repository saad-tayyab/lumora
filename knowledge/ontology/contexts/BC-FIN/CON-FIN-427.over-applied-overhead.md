---
id: CON-FIN-427
name: Over-Applied Overhead
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

# Over-Applied Overhead

## Definition

Occurs when manufacturing overhead applied to jobs exceeds the actual manufacturing overhead costs incurred during the period. Indicates the predetermined rate was too high.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Amount by which applied overhead exceeds actual overhead |
| disposition | string | How to dispose: close to Cost of Goods Sold or prorate among WIP, Finished Goods, and COGS |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
