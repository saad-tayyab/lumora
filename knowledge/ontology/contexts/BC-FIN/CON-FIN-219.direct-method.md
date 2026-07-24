---
id: CON-FIN-219
name: Direct Method
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

# Direct Method

## Definition

A method of reporting cash flows from operating activities that lists each major class of gross cash receipts and gross cash payments, such as cash received from customers and cash paid for merchandise, operating expenses, interest, and income taxes.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_received_from_customers | decimal | Cash inflows from sales adjusted for changes in accounts receivable |
| cash_paid_for_merchandise | decimal | Cash outflows for inventory adjusted for changes in inventories and accounts payable |
| cash_paid_for_operating_expenses | decimal | Cash outflows for operating expenses excluding depreciation, adjusted for prepaid expenses and accrued expenses payable |
| cash_paid_for_interest | decimal | Cash outflows for interest adjusted for changes in interest payable |
| cash_paid_for_income_taxes | decimal | Cash outflows for income taxes adjusted for changes in income taxes payable |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
