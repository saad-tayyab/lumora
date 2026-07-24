---
id: CON-FIN-554
name: Forecast vs Actual Investment Performance
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

# Forecast vs Actual Investment Performance

## Definition

The comparison between projected investment outcomes (forecasts) and realized results, used to evaluate the accuracy of capital budgeting projections and improve future estimation processes.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| forecasted_irr | decimal | Projected internal rate of return |
| actual_irr | decimal | Realized internal rate of return |
| forecast_accuracy | decimal | Measure of prediction accuracy |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
