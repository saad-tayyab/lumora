---
id: CON-FIN-156
name: Sales Discount (Gross Method)
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

# Sales Discount (Gross Method)

## Definition

Under the gross method, a sales invoice is recorded at the full invoice amount. If the customer pays within the discount period, the discount is recorded as a debit to Sales Discounts (a contra account to Sales).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| initial_recording | entry | Record at gross invoice amount |
| discount_taken | entry | Debit Cash, debit Sales Discounts, credit Accounts Receivable |
| discount_not_taken | entry | Debit Cash, credit Accounts Receivable for full amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
