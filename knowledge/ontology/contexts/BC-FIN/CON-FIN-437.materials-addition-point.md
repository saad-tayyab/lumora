---
id: CON-FIN-437
name: Materials Addition Point
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

# Materials Addition Point

## Definition

The point in the manufacturing process where direct materials are added. This determines whether beginning WIP receives 0% or 100% materials equivalent units in the current period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| addition_timing | string | Beginning of process, evenly throughout, or at specific point |
| impact_on_equivalent_units | string | How the timing affects equivalent unit calculation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
