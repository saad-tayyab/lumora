---
id: CON-FIN-308
name: Salary Allowance
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

# Salary Allowance

## Definition

An allocation of partnership income to a partner based on services rendered, recorded as a division of net income rather than as an expense, since partners are not employees.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| partner_name | string | The partner receiving the allowance |
| monthly_amount | numeric | Monthly salary allowance amount |
| annual_amount | numeric | Annual salary allowance (monthly × 12) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
