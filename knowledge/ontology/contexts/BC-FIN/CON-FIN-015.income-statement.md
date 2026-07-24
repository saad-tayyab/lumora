---
id: CON-FIN-015
name: Income Statement
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

# Income Statement

## Definition

A summary of the revenue and expenses for a specific period of time, such as a month or a year. The excess of revenue over expenses is net income; if expenses exceed revenue, it is a net loss.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue | money | Total revenue earned during the period |
| expenses | money | Total expenses incurred during the period |
| net_income | money | Revenue minus expenses (positive = net income, negative = net loss) |
| period | date_range | Time period covered |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
