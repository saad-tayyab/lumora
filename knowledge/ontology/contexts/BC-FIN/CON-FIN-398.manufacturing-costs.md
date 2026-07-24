---
id: CON-FIN-398
name: Manufacturing Costs
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

# Manufacturing Costs

## Definition

The sum of direct materials, direct labor, and manufacturing overhead costs incurred during a period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Total Manufacturing Costs = Direct Materials + Direct Labor + Manufacturing Overhead |
| period | string | Costs incurred during a specific period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
