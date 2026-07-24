---
id: CON-FIN-579
name: Measure Map
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

# Measure Map

## Definition

A visual representation showing the cause-and-effect relationships between performance metrics, often used to quantify the impact of one metric on another.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| metrics | array | Performance metrics included in the map |
| impact_relationships | array | How changes in one metric affect another |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
