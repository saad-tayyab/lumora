---
id: CON-FIN-356
name: Cash Paid for Income Taxes
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

# Cash Paid for Income Taxes

## Definition

The actual cash paid for income taxes during the period, computed by adjusting income tax expense for changes in income taxes payable.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| income_tax_expense | decimal | Income tax expense from the income statement |
| change_in_income_taxes_payable | decimal | Increase (subtract) or decrease (add) in income taxes payable |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
