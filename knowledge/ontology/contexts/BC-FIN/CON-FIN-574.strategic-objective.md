---
id: CON-FIN-574
name: Strategic Objective
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

# Strategic Objective

## Definition

A specific goal that defines the purpose of an action taken within a company. Each strategic objective is a subcomponent of the overall entity's mission statement or strategy.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| description | string | Clear statement of the goal |
| perspective | string | Which performance perspective this belongs to |
| performance_metrics | array | Metrics used to measure achievement of this objective |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
