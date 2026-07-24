---
id: CON-FIN-443
name: Push Manufacturing
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

# Push Manufacturing

## Definition

A manufacturing approach where production is scheduled based on estimated customer demand rather than actual orders. Results in higher inventory levels compared to pull manufacturing.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| production_trigger | string | Demand estimates trigger production |
| inventory_level | string | Higher inventory levels to buffer demand uncertainty |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
