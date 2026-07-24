---
id: CON-FIN-143
name: Credit Card Expense
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

# Credit Card Expense

## Definition

Processing fees charged by clearinghouses or issuing banks for credit card transactions.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| recording | periodic | Recorded as expense periodically |
| basis | percentage | Typically a percentage of credit card sales |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
