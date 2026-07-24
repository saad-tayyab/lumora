---
id: CON-FIN-429
name: Equivalent Units of Production
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

# Equivalent Units of Production

## Definition

The number of whole units that could have been produced from start to finish during a period, given the amount of work actually performed. Used to measure output in process costing when units are partially complete.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| whole_units | integer | Total physical units in production during the period |
| percent_complete | decimal | Percentage of completion for materials or conversion |
| equivalent_units | decimal | Whole units multiplied by percent complete |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
