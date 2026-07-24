---
id: CON-FIN-552
name: Capital Investment Project
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Capital Investment Project

## Definition

A proposed investment in long-term assets such as equipment, machinery, vehicles, or facilities that is expected to generate future economic benefits.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| project_name | string | Identifier for the project |
| initial_cost | decimal | Upfront investment amount |
| useful_life | integer | Expected useful life in years |
| residual_value | decimal | Estimated value at end of useful life |
| annual_net_cash_flows | array | Expected annual cash inflows |
| desired_rate_of_return | decimal | Minimum acceptable return |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
