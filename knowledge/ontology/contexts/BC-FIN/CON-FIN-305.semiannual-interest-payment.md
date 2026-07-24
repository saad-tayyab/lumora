---
id: CON-FIN-305
name: Semiannual Interest Payment
context: BC-FIN
type: event
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Semiannual Interest Payment

## Definition

A periodic interest payment made to bondholders, typically calculated as face value multiplied by the contract rate multiplied by 1/2 year.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| face_value | numeric | The principal amount of the bond |
| contract_rate | percentage | The stated annual interest rate |
| payment_amount | numeric | Face value × contract rate × 1/2 |
| payment_date | date | The date the interest is paid |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
