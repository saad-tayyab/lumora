---
id: CON-FIN-164
name: Delivery Expense
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

# Delivery Expense

## Definition

Freight costs paid by the seller for delivering merchandise to customers (FOB destination). Reported as a selling expense.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| recording | entry | Debit Delivery Expense, credit Cash |
| reporting | string | Selling expense on income statement |
| also_known_as | string | Freight Out |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
