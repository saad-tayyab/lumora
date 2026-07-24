---
id: CON-FIN-283
name: Payroll Summary
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

# Payroll Summary

## Definition

An aggregation of payroll data by department or category, used for journalizing the payroll entry.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| sales_salaries | decimal | Total salaries for sales personnel |
| office_salaries | decimal | Total salaries for office/admin staff |
| operations_salaries | decimal | Total salaries for operations/factory workers |
| officers_salaries | decimal | Total salaries for company officers |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
