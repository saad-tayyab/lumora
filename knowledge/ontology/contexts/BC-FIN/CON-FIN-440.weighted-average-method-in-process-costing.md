---
id: CON-FIN-440
name: Weighted Average Method in Process Costing
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

# Weighted Average Method in Process Costing

## Definition

A process costing method that combines beginning work in process costs with current period costs to compute a single average cost per equivalent unit. Does not separate work done in prior periods from current period work.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| beginning_wip_costs | decimal | Costs in beginning work in process inventory |
| current_period_costs | decimal | Costs added during the current period |
| total_costs | decimal | Sum of beginning WIP and current period costs |
| equivalent_units | decimal | Total equivalent units (includes work from prior periods in beginning WIP) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
