---
id: CON-FIN-157
name: Sales Discount (Net Method)
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Sales Discount (Net Method)

## Definition

Under the net method, a sales invoice is recorded at the net amount (invoice less discount). If the customer does not take the discount, the discount amount is credited to Sales.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| initial_recording | entry | Record at net amount (invoice minus discount) |
| discount_taken | entry | Debit Cash, credit Accounts Receivable for net amount |
| discount_not_taken | entry | Debit Cash for full amount, credit Accounts Receivable for net, credit Sales for discount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
