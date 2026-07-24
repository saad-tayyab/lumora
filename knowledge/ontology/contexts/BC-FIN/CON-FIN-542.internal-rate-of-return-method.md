---
id: CON-FIN-542
name: Internal Rate of Return Method
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

# Internal Rate of Return Method

## Definition

A capital investment evaluation method that uses present value concepts to compute the rate of return expected from a proposal based on its net cash flows; also called the time-adjusted rate of return method.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount_to_invest | decimal | Initial investment required |
| equal_annual_cash_flows | decimal | Expected annual net cash inflow (when equal) |
| pv_factor | decimal | Present value factor for an annuity of $1, computed as amount to invest divided by annual cash flow |
| internal_rate_of_return | decimal | The discount rate at which NPV equals zero |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
