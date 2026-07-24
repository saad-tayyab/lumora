---
id: CON-FIN-551
name: Net Present Value (NPV)
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

# Net Present Value (NPV)

## Definition

The difference between the present value of future net cash flows and the initial investment cost. A positive NPV indicates the project exceeds the desired rate of return.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| present_value_of_cash_flows | decimal | Sum of discounted future cash flows |
| initial_investment | decimal | Amount to be invested upfront |
| desired_rate_of_return | decimal | Discount rate used for present value calculations |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
