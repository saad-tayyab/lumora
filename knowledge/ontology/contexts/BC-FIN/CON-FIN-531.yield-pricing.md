---
id: CON-FIN-531
name: Yield Pricing
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

# Yield Pricing

## Definition

A differential pricing strategy used by high-fixed-cost service businesses that charges different prices based on demand for fixed capacity — higher prices during peak demand, lower prices during off-peak periods.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| peak_price | decimal | Price charged during high-demand periods |
| off_peak_price | decimal | Price charged during low-demand periods |
| discount_strategy | string | Strategy for filling excess capacity (e.g., standby discounts, early booking discounts) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
