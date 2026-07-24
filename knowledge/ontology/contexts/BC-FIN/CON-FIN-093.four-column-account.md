---
id: CON-FIN-093
name: Four-Column Account
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

# Four-Column Account

## Definition

An account format that includes columns for date, debit, credit, and running balance. More practical than T accounts for actual business use.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| date | date | Date of transaction |
| debit | money | Debit amount |
| credit | money | Credit amount |
| balance | money | Running balance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
