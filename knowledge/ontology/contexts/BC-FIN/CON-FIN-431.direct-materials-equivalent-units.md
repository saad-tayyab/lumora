---
id: CON-FIN-431
name: Direct Materials Equivalent Units
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

# Direct Materials Equivalent Units

## Definition

Equivalent units for direct materials, computed based on when materials are added during the process. Materials added at the beginning of the process result in 100% complete for materials regardless of conversion percentage.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| materials_addition_point | string | When materials are added: beginning of process, evenly, or at specific points |
| equivalent_units | decimal | Whole units x percent materials added in the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
