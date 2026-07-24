---
id: CON-FIN-536
name: Average Rate of Return
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

# Average Rate of Return

## Definition

The ratio of estimated average annual income to the average investment amount. Computed as: Average Annual Income / Average Investment, where Average Investment = (Initial Cost + Residual Value) / 2.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| average_annual_income | decimal | Total income over useful life divided by number of years |
| average_investment | decimal | (Initial cost + residual value) / 2 |
| useful_life_years | integer | Estimated useful life of the project |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
