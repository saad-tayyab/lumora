---
id: CON-FIN-432
name: Conversion Equivalent Units
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

# Conversion Equivalent Units

## Definition

Equivalent units for conversion costs, computed based on the percentage of completion of the units with respect to direct labor and manufacturing overhead, which are typically incurred evenly throughout the process.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| percent_complete | decimal | Percentage of conversion work completed |
| equivalent_units | decimal | Whole units x percent conversion completed in the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
