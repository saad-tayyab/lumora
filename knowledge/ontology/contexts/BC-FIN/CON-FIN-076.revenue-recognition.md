---
id: CON-FIN-076
name: Revenue Recognition
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

# Revenue Recognition

## Definition

The process of recording revenue when control of goods transfers to the customer, determined by the terms of sale (shipment or receipt depending on channel and geography).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| performance_obligation | String | Single performance obligation consisting of product sale to customers |
| control_transfer | String | When customer can direct use and receive substantially all benefits |
| transaction_price | Money | Invoiced sales price less anticipated returns, discounts, and claims |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
