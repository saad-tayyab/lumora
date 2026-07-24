---
id: CON-FIN-439
name: FIFO Method
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

# FIFO Method

## Definition

A process costing method that separates beginning inventory from current period production. Only current period costs and current period equivalent units are used to compute cost per equivalent unit. Beginning inventory costs are carried forward separately.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| method_name | string | First-In, First-Out |
| beginning_inventory_treatment | string | Beginning inventory costs are kept separate from current period costs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
