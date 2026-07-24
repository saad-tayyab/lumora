---
id: CON-FIN-272
name: Pension
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

# Pension

## Definition

A cash payment to retired employees based on the employer's pension plan. Two types: defined contribution and defined benefit plans.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| plan_type | string | Either 'defined_contribution' or 'defined_benefit' |
| employer_contribution | decimal | Amount contributed by employer to the plan |
| unfunded_liability | decimal | Unfunded portion of pension obligation (defined benefit only) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
