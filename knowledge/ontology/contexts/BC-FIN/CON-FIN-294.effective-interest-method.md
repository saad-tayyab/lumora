---
id: CON-FIN-294
name: Effective Interest Method
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

# Effective Interest Method

## Definition

A method of amortizing bond discount or premium where interest expense is computed by multiplying the carrying amount of the bonds by the market interest rate at issuance, producing a constant rate of interest expense.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| carrying_amount | numeric | The book value of the bonds at the beginning of each period |
| market_rate | percentage | The effective interest rate at issuance |
| interest_expense | numeric | Carrying amount multiplied by market rate |
| cash_payment | numeric | Face value multiplied by contract rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
