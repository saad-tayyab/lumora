---
id: CON-FIN-430
name: Whole Units
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

# Whole Units

## Definition

The physical number of units in production during a period, whether completed or still in process. Also referred to as physical units.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| units_completed | integer | Units fully completed and transferred out |
| units_in_ending_inventory | integer | Units still in process at period end |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
