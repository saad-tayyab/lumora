---
id: CON-FIN-502
name: Cash Disbursements Schedule
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

# Cash Disbursements Schedule

## Definition

A supporting schedule for the cash budget that estimates cash payments for manufacturing costs, operating expenses, capital expenditures, dividends, and taxes.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| manufacturing_payments | number | Cash payments for manufacturing costs |
| operating_expense_payments | number | Cash payments for selling and administrative expenses |
| capital_expenditure_payments | number | Cash payments for equipment and other long-term assets |
| dividend_payments | number | Cash dividends paid to shareholders |
| tax_payments | number | Income tax payments |
| total_disbursements | number | Total cash payments expected |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
