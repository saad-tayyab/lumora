---
id: CON-FIN-322
name: Revenue per Employee
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

# Revenue per Employee

## Definition

An efficiency ratio measuring the revenue generated per employee, calculated as total revenue divided by the number of employees.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_revenue | numeric | Total revenue for the period |
| number_of_employees | integer | Average or period-end number of employees |
| ratio | numeric | Revenue divided by number of employees |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
