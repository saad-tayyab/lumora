---
id: CON-FIN-298
name: Present Value of $1
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

# Present Value of $1

## Definition

The current worth of a single future amount discounted at a given interest rate for a specified number of periods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| future_amount | decimal | The amount to be received in the future |
| interest_rate | decimal | The discount rate per period |
| periods | integer | Number of compounding periods |
| present_value | decimal | The current worth of the future amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
