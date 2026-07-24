---
id: CON-FIN-355
name: Cash Paid for Interest
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

# Cash Paid for Interest

## Definition

The actual cash paid for interest during the period, computed by adjusting interest expense for changes in interest payable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| interest_expense | decimal | Interest expense from the income statement |
| change_in_interest_payable | decimal | Increase (subtract) or decrease (add) in interest payable |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
