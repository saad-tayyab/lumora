---
id: CON-FIN-033
name: Accounts Receivable
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

# Accounts Receivable

## Definition

Money owed to the business by customers for goods or services provided on credit, recorded as an asset with a normal debit balance.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| customer_name | string | Name of the customer who owes money |
| amount_owed | decimal | Outstanding balance owed to the business |
| due_date | date | Date payment is expected |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
