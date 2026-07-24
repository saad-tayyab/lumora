---
id: CON-FIN-506
name: Direct Materials Price Variance
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

# Direct Materials Price Variance

## Definition

The difference between the actual price paid for direct materials and the standard price expected, multiplied by the actual quantity purchased.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_price | decimal | Actual price per unit of material |
| standard_price | decimal | Standard price per unit of material |
| actual_quantity | decimal | Actual quantity of material purchased |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
