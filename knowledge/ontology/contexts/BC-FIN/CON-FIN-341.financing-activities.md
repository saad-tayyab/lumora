---
id: CON-FIN-341
name: Financing Activities
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

# Financing Activities

## Definition

The section of the statement of cash flows that reports cash inflows and outflows related to changes in a company's long-term liabilities and stockholders' equity, such as issuing stock, borrowing, and paying dividends.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cash_received_from_issuing_stock | decimal | Cash inflows from issuing common or preferred stock |
| cash_paid_to_retire_bonds | decimal | Cash outflows for retiring bonds payable |
| cash_paid_as_dividends | decimal | Cash outflows for dividend payments |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
