---
id: CON-FIN-301
name: Interest Expense
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

# Interest Expense

## Definition

The cost of borrowing for a period, equal to cash interest paid plus/minus discount/premium amortization.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_interest | decimal | Face amount × contract rate per period |
| amortization | decimal | Discount added or premium deducted |
| total_expense | decimal | The total interest expense for the period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
