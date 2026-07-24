---
id: CON-FIN-023
name: Depreciation
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

# Depreciation

## Definition

The process of allocating the cost of a fixed asset to expense over its useful life. Depreciation is caused by physical factors (wear and tear) or functional factors (obsolescence).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| expense_amount | decimal | The amount allocated to expense for the period |
| method | string | The method used to compute depreciation (straight-line, units-of-activity, double-declining-balance) |
| depreciable_cost | decimal | Initial cost minus residual value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
