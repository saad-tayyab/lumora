---
id: CON-FIN-528
name: Production Bottleneck
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

# Production Bottleneck

## Definition

A point in the manufacturing process where demand for the company's product exceeds the ability to produce the product, also called a constraint.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| constraint_type | string | Type of constraint (e.g., furnace hours, heat treatment hours) |
| capacity | decimal | Maximum capacity of the bottleneck resource per period |
| demand_exceeding_capacity | boolean | Whether demand exceeds production capability at this point |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
