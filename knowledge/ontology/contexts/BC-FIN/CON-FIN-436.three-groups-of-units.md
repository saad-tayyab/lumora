---
id: CON-FIN-436
name: Three Groups of Units
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

# Three Groups of Units

## Definition

In FIFO process costing, units are classified into three groups: (1) beginning work in process inventory, (2) units started and completed during the period, and (3) ending work in process inventory.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| group_1_beginning | string | Units in beginning WIP - work done in prior period is ignored |
| group_2_started_completed | string | Units started and completed entirely in current period |
| group_3_ending | string | Units partially completed at period end |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
