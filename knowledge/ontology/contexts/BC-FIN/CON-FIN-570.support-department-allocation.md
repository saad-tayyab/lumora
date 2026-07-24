---
id: CON-FIN-570
name: Support Department Allocation
context: BC-FIN
type: process
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Support Department Allocation

## Definition

The process of assigning costs from support departments (e.g., purchasing, payroll, legal) to operating divisions based on their usage of support services.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| support_department | string | Department providing the service |
| total_expense | decimal | Total cost of the support department |
| total_usage | decimal | Total units of service consumed |
| allocation_rate | decimal | Expense per unit of service |
| division_usage | decimal | Service units consumed by a specific division |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
