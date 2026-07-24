---
id: CON-FIN-465
name: Target Profit Sales
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

# Target Profit Sales

## Definition

The level of sales (in units or dollars) required to achieve a desired or target operating income. Computed as (Fixed Costs + Target Profit) ÷ Unit Contribution Margin.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| target_income | decimal | Desired operating income amount |
| required_units | integer | Units needed to achieve target profit |
| formula | string | (Fixed Costs + Target Profit) / Unit Contribution Margin |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
