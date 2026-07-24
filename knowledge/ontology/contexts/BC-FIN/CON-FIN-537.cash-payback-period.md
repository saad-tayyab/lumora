---
id: CON-FIN-537
name: Cash Payback Period
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

# Cash Payback Period

## Definition

The length of time required for an investment to recover its initial cost from net cash flows. Computed as: Amount to Be Invested / Annual Net Cash Flow (when cash flows are equal).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| initial_investment | decimal | Amount to be invested |
| annual_net_cash_flow | decimal | Expected annual net cash inflow |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
