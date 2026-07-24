---
id: CON-FIN-530
name: Unit Contribution Margin per Bottleneck Hour
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

# Unit Contribution Margin per Bottleneck Hour

## Definition

The best measure of profitability in a bottleneck operation, computed by dividing a product's unit contribution margin by the bottleneck hours required per unit.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| unit_contribution_margin | decimal | Selling price minus variable cost per unit |
| bottleneck_hours_per_unit | decimal | Hours of bottleneck resource consumed per unit |
| contribution_margin_per_bottleneck_hour | decimal | Unit contribution margin divided by bottleneck hours per unit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
