---
id: CON-FIN-273
name: Defined Contribution Plan
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Defined Contribution Plan

## Definition

A pension plan where the company invests contributions on behalf of the employee. The employee's pension depends on total contributions and investment returns. Example: 401k plan.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| employer_match_rate | decimal | Percentage of employee contribution matched by employer |
| employee_contribution_rate | decimal | Percentage of salary contributed by employee |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
