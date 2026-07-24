---
id: CON-FIN-620
name: Price Variances
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

# Price Variances

## Definition

The difference between the actual price paid for an input and the standard (expected) price, multiplied by the actual quantity purchased. Used to measure purchasing efficiency and cost control.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_price | Money | Price actually paid per unit of input |
| standard_price | Money | Expected or budgeted price per unit |
| actual_quantity | Number | Actual quantity of input purchased |
| variance_amount | Money | The calculated price variance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
