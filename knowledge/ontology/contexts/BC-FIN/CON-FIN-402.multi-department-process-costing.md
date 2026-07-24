---
id: CON-FIN-402
name: Multi-Department Process Costing
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Multi-Department Process Costing

## Definition

A process costing system where units pass through multiple departments or processes. Each department maintains its own work in process account and cost of production report. Transferred-in costs connect departments.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| department_sequence | list | Order of departments through which units pass |
| transferred_in_costs | decimal | Costs carried from prior departments |
| department_costs | decimal | Costs added in the current department |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
