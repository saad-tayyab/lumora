---
id: CON-FIN-433
name: Cost of Production Report
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

# Cost of Production Report

## Definition

A report summarizing the production activity and costs for a department during a period. Contains four steps: (1) determine units to be assigned costs, (2) compute equivalent units, (3) determine costs per equivalent unit, and (4) assign costs to units completed and ending inventory.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| units_section | object | Step 1: Whole units to be assigned costs |
| equivalent_units_section | object | Step 2: Equivalent units for materials and conversion |
| cost_per_equivalent_unit_section | object | Step 3: Cost per equivalent unit calculations |
| cost_assignment_section | object | Step 4: Costs assigned to completed units and ending WIP |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
