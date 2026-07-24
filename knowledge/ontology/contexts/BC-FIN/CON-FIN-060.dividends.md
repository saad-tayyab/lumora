---
id: CON-FIN-060
name: Dividends
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

# Dividends

## Definition

A distribution of cash or other assets by a corporation to its stockholders.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| amount | Money | Amount distributed per share |
| declaration_date | date | Date declared by board |
| payment_date | date | Date payment is made |
| record_date | date | Date stockholders of record determined |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
