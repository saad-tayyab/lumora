---
id: CON-FIN-050
name: Depreciation Expense
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Depreciation Expense

## Definition

The allocation of a fixed asset's cost over its useful life, recorded as an expense each accounting period. Represents the consumption of the asset's economic benefit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| period | date | Accounting period the depreciation applies to |
| amount | decimal | Depreciation amount for the period |
| asset | string | The fixed asset being depreciated |
| method | string | Depreciation method used (straight-line, declining balance, etc.) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
