---
id: CON-FIN-520
name: Differential Analysis
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

# Differential Analysis

## Definition

A decision-making tool that analyzes differential revenues and costs to determine the differential impact on profit of two alternative courses of action.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| alternative_1 | string | First course of action being compared |
| alternative_2 | string | Second course of action being compared |
| differential_revenue | decimal | Difference in revenue between alternatives |
| differential_cost | decimal | Difference in cost between alternatives |
| differential_profit | decimal | Net impact on profit from choosing one alternative over another |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
