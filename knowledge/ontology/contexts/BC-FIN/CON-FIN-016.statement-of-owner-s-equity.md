---
id: CON-FIN-016
name: Statement of Owner's Equity
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

# Statement of Owner's Equity

## Definition

A summary of the changes in owner's equity that have occurred during a specific period of time, such as a month or a year. Prepared after the income statement.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| beginning_capital | money | Owner's equity at the start of the period |
| additional_investment | money | Additional owner investments during the period |
| net_income | money | Net income from the income statement |
| withdrawals | money | Owner withdrawals during the period |
| ending_capital | money | Owner's equity at the end of the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
