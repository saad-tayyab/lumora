---
id: CON-FIN-428
name: Under-Applied Overhead
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

# Under-Applied Overhead

## Definition

Occurs when actual manufacturing overhead costs exceed the overhead applied to jobs during the period. Indicates the predetermined rate was too low.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | decimal | Amount by which actual overhead exceeds applied overhead |
| disposition | string | How to dispose: close to Cost of Goods Sold or prorate among WIP, Finished Goods, and COGS |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
