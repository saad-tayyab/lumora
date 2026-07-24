---
id: CON-FIN-476
name: Manufacturing Overhead Cost per Unit Comparison
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

# Manufacturing Overhead Cost per Unit Comparison

## Definition

Comparing manufacturing overhead costs per unit under different allocation methods (single plantwide, multiple department, ABC) to identify cost distortion.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| plantwide_rate | decimal | MOH per unit using single plantwide rate |
| departmental_rate | decimal | MOH per unit using multiple department rates |
| abc_rate | decimal | MOH per unit using activity-based costing |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
