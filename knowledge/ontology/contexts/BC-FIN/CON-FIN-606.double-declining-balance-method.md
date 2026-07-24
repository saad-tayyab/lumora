---
id: CON-FIN-606
name: Double-Declining-Balance Method
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Double-Declining-Balance Method

## Definition

An accelerated depreciation method that applies a constant rate to the declining book value of the asset.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| rate | number | Twice the straight-line rate |
| book_value | Money | Declining book value used as base |
| switch_to_SL | boolean | Switch to straight-line when optimal |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
