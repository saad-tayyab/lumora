---
id: CON-FIN-569
name: Residual Income
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

# Residual Income

## Definition

The net operating income that an investment center earns above the minimum required return on its operating assets. Calculated as Operating Income minus (Minimum Rate of Return multiplied by Invested Assets).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| operating_income | decimal | The income generated from normal business operations |
| minimum_rate_of_return | decimal | The minimum acceptable rate of return on invested assets |
| invested_assets | decimal | The total assets invested in a division or segment |
| residual_income_amount | decimal | The amount of income above the minimum required return |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
