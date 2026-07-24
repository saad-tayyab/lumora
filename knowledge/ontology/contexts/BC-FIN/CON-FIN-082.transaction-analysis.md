---
id: CON-FIN-082
name: Transaction Analysis
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

# Transaction Analysis

## Definition

The process of identifying which accounts are affected by a business transaction and how they change (increase or decrease) within the accounting equation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| affected_accounts | list | List of accounts affected by the transaction |
| direction | string | Whether each account increases or decreases |
| amount | money | Dollar amount of the change |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
