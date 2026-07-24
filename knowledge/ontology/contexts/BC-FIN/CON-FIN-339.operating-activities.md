---
id: CON-FIN-339
name: Operating Activities
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

# Operating Activities

## Definition

The section of the statement of cash flows that reports cash inflows and outflows from a company's day-to-day operations, such as selling goods and services, paying expenses, and collecting receivables.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_received_from_customers | decimal | Cash inflows from sales revenue |
| cash_paid_for_merchandise | decimal | Cash outflows for inventory purchases |
| cash_paid_for_operating_expenses | decimal | Cash outflows for operating costs |
| cash_paid_for_interest | decimal | Cash outflows for interest expense |
| cash_paid_for_income_taxes | decimal | Cash outflows for income taxes |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
