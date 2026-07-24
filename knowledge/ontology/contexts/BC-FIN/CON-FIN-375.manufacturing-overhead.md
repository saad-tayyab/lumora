---
id: CON-FIN-375
name: Manufacturing Overhead
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

# Manufacturing Overhead

## Definition

All manufacturing costs other than direct materials and direct labor. Includes indirect materials, indirect labor, factory depreciation, factory utilities, and other factory costs. Applied to jobs using a predetermined overhead rate.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_overhead | decimal | Total actual manufacturing overhead costs incurred |
| applied_overhead | decimal | Overhead applied to jobs using the predetermined rate |
| predetermined_rate | decimal | Rate used to apply overhead (e.g., per machine hour or direct labor hour) |
| over_or_under_applied | decimal | Difference between actual and applied overhead |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
