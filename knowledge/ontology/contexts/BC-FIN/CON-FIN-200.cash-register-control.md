---
id: CON-FIN-200
name: Cash Register Control
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Cash Register Control

## Definition

A control mechanism for protecting cash received in over-the-counter sales. Each clerk receives a predetermined change fund, and the register displays amounts for customer verification.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| change_fund | string | Predetermined amount of cash given to each clerk at start of shift |
| customer_verification | string | Register displays amount to customer for verification |
| end_of_shift_count | string | Cash counted and compared to register records at end of shift |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
