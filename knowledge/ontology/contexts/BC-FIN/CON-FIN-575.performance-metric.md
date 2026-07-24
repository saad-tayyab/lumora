---
id: CON-FIN-575
name: Performance Metric
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

# Performance Metric

## Definition

A quantifiable measure used to assess performance in achieving strategic objectives. At least one metric is used for each strategic objective.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Name of the metric |
| value | decimal | Current measured value |
| target | decimal | Desired performance level |
| perspective | string | Which performance perspective this belongs to |
| strategic_objective | string | The strategic objective this metric measures |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
