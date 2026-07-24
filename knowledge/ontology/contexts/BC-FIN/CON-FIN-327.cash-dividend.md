---
id: CON-FIN-327
name: Cash Dividend
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

# Cash Dividend

## Definition

A distribution of cash to stockholders declared by the board of directors, recorded as a liability when declared and paid on the payment date.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| declaration_date | Date | Date board declares the dividend |
| record_date | Date | Date determining which stockholders receive the dividend |
| payment_date | Date | Date cash is distributed to stockholders |
| amount_per_share | Money | Dividend amount per share |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
