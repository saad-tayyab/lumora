---
id: CON-FIN-540
name: Net Present Value Method
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

# Net Present Value Method

## Definition

A capital investment evaluation method that compares the amount to be invested with the present value of expected net cash inflows; also called the discounted cash flow method.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount_to_invest | decimal | Initial cash outlay for the investment |
| present_value_of_cash_inflows | decimal | Sum of discounted future net cash flows |
| net_present_value | decimal | PV of cash inflows minus amount to invest |
| hurdle_rate | decimal | Minimum desired rate of return used for discounting |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
