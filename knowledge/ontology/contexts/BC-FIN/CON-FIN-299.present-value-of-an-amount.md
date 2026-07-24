---
id: CON-FIN-299
name: Present Value of an Amount
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

# Present Value of an Amount

## Definition

The current worth of a single sum of money to be received (or paid) at a future date, determined by discounting at a specified interest rate.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| future_value | decimal | Amount to be received in the future |
| discount_rate | decimal | Interest rate used for discounting |
| periods | integer | Number of periods until receipt |
| present_value_factor | decimal | Factor from present value table for $1 |
| present_value | decimal | Future value multiplied by present value factor |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
