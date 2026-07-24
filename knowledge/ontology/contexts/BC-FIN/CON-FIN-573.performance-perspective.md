---
id: CON-FIN-573
name: Performance Perspective
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

# Performance Perspective

## Definition

One of four categories in the balanced scorecard that organizes performance metrics by type: Financial, Customer, Internal Processes, and Learning and Growth.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| perspective_type | enum | Financial, Customer, Internal Processes, or Learning and Growth |
| strategic_objectives | array | Specific goals within this perspective |
| focus_area | string | The type of performance this perspective measures |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
