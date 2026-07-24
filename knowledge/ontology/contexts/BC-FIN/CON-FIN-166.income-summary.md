---
id: CON-FIN-166
name: Income Summary
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

# Income Summary

## Definition

A temporary account used during the closing process. Revenue and expense accounts are closed to Income Summary, which is then closed to owner's capital.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| close_revenues | entry | Debit revenue accounts, credit Income Summary |
| close_expenses | entry | Debit Income Summary, credit expense accounts (including COGS) |
| close_to_capital | entry | Transfer Income Summary balance to owner's capital |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
