---
id: CON-FIN-541
name: Present Value Index
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

# Present Value Index

## Definition

A relative measure of investment attractiveness computed as the total present value of net cash flow divided by the amount to be invested, used to rank proposals when investment funds are limited.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| total_pv_of_cash_flows | decimal | Present value of all expected net cash inflows |
| amount_to_invest | decimal | Initial investment required |
| pv_index | decimal | Total PV of cash flows divided by amount to invest |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
