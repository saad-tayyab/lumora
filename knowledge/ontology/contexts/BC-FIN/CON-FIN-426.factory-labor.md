---
id: CON-FIN-426
name: Factory Labor
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

# Factory Labor

## Definition

Labor costs incurred in the manufacturing process, split between direct labor (traceable to specific jobs) and indirect labor (factory supervision, maintenance, part of manufacturing overhead).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| direct_labor | decimal | Labor costs directly traceable to specific jobs |
| indirect_labor | decimal | Factory labor not directly traceable to jobs (supervision, maintenance) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
