---
id: CON-FIN-418
name: Cost Variance Analysis
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

# Cost Variance Analysis

## Definition

The process of comparing costs per equivalent unit across periods to identify trends, inefficiencies, or improvements in the production process. Used to evaluate cost performance and identify problems.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| period_comparison | string | Comparison of costs across multiple periods |
| cost_per_unit_trend | string | Direction of unit cost changes over time |
| efficiency_metrics | object | Yield ratios and efficiency indicators |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
