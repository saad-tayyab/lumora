---
id: CON-FIN-603
name: Current Assets
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Current Assets

## Definition

Assets expected to be converted to cash, sold, or consumed within one year or the operating cycle.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash | Money | Cash on hand and in banks |
| receivables | Money | Amounts owed by customers |
| inventory | Money | Merchandise and supplies on hand |
| prepaid_expenses | Money | Advance payments for future benefits |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
