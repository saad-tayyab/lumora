---
id: CON-FIN-097
name: Overstatement Error
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Overstatement Error

## Definition

An error where an account balance is recorded as more than its correct amount, inflating the reported value.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| account | string | The account with the overstated balance |
| recorded_amount | decimal | The incorrect higher amount |
| correct_amount | decimal | The actual correct amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
