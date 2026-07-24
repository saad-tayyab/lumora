---
id: CON-FIN-245
name: Double-Declining-Balance Depreciation
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

# Double-Declining-Balance Depreciation

## Definition

An accelerated depreciation method that provides for a declining periodic expense over the expected useful life. Rate = (100% / Useful Life) × 2, applied to beginning book value.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| dbr_rate | decimal | Double the straight-line rate |
| annual_depreciation | decimal | Declining depreciation each year based on book value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
