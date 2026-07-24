---
id: CON-FIN-390
name: Period Cost
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

# Period Cost

## Definition

A cost that is used in generating revenue during the current period but is not involved in the manufacturing process. Recorded as selling or administrative expenses.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| categories | string | Selling expenses and administrative expenses |
| treatment | string | Expensed in the period incurred |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
