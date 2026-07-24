---
id: CON-FIN-604
name: Current Liabilities
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

# Current Liabilities

## Definition

Obligations expected to be settled within one year or the operating cycle.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| accounts_payable | Money | Amounts owed to suppliers |
| notes_payable | Money | Short-term loan obligations |
| accrued_liabilities | Money | Expenses incurred but not yet paid |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
