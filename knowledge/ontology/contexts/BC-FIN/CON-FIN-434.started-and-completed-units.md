---
id: CON-FIN-434
name: Started and Completed Units
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

# Started and Completed Units

## Definition

Units that were both started into production and fully completed during the current period. Calculated as units completed minus beginning work in process units.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| units_completed | integer | Total units completed and transferred out |
| beginning_inventory | integer | Units in beginning work in process |
| started_and_completed | integer | Units completed minus beginning inventory |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
