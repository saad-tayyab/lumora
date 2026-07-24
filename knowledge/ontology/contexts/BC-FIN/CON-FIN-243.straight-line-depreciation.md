---
id: CON-FIN-243
name: Straight-Line Depreciation
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

# Straight-Line Depreciation

## Definition

A depreciation method that provides the same amount of depreciation expense for each year of the asset's useful life. Computed as (Cost - Residual Value) / Useful Life.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| annual_depreciation | decimal | Constant annual depreciation expense |
| rate_percentage | decimal | 100% divided by useful life in years |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
