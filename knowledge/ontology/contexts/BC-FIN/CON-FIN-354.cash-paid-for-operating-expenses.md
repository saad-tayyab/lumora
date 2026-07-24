---
id: CON-FIN-354
name: Cash Paid for Operating Expenses
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

# Cash Paid for Operating Expenses

## Definition

The actual cash paid for operating expenses during the period, computed by adjusting operating expenses (excluding depreciation) for changes in prepaid expenses and accrued expenses payable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| operating_expenses_excluding_depreciation | decimal | Total operating expenses minus depreciation |
| change_in_prepaid_expenses | decimal | Increase (add) or decrease (subtract) in prepaid expenses |
| change_in_accrued_expenses_payable | decimal | Increase (subtract) or decrease (add) in accrued expenses payable |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
