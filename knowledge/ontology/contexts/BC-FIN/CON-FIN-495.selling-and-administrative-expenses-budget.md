---
id: CON-FIN-495
name: Selling and Administrative Expenses Budget
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

# Selling and Administrative Expenses Budget

## Definition

A budget that estimates all non-manufacturing operating expenses including selling costs and administrative costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| variable_selling_expenses | number | Variable portion of selling expenses |
| fixed_selling_expenses | number | Fixed portion of selling expenses |
| variable_admin_expenses | number | Variable portion of administrative expenses |
| fixed_admin_expenses | number | Fixed portion of administrative expenses |
| total_operating_expenses | number | Sum of all selling and administrative expenses |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
