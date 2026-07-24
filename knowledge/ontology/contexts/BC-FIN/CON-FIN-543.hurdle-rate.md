---
id: CON-FIN-543
name: Hurdle Rate
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

# Hurdle Rate

## Definition

The minimum desired rate of return used in capital investment analysis as the discount rate for present value calculations; based on the cost of capital and investment risk.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| rate | decimal | The minimum acceptable percentage return |
| basis | string | Factors include cost of capital, investment risk, and opportunity cost |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
