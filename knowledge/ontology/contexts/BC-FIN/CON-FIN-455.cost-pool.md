---
id: CON-FIN-455
name: Cost Pool
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

# Cost Pool

## Definition

A grouping of individual cost items that will be allocated to cost objects using a single allocation base.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Name of the cost pool |
| total_cost | decimal | Total costs in the pool |
| allocation_base | string | Base used to allocate pool costs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
