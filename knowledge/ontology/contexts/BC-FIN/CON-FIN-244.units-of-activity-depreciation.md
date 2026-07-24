---
id: CON-FIN-244
name: Units-of-Activity Depreciation
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

# Units-of-Activity Depreciation

## Definition

A depreciation method that provides the same amount of depreciation expense for each unit of activity of the asset. Depreciation per unit = (Cost - Residual Value) / Total Estimated Units.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| depreciation_per_unit | decimal | Depreciation rate per unit of activity |
| total_estimated_units | integer | Total expected units of activity over asset life |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
