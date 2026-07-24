---
id: CON-FIN-539
name: Annuity
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

# Annuity

## Definition

A series of equal net cash flows occurring at fixed time intervals, such as monthly rent, salaries, or bond interest payments.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| periodic_payment | decimal | Equal payment amount per period |
| number_of_periods | integer | Total number of payment periods |
| interest_rate | decimal | Discount rate per period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
