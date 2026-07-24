---
id: CON-FIN-131
name: Subsidiary Inventory Ledger
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Subsidiary Inventory Ledger

## Definition

A detailed ledger that maintains separate records for each type of merchandise, tracking both quantities and costs. Used in perpetual inventory systems to provide item-level detail.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| detail_level | string | Individual records for each merchandise item |
| tracks_quantities | boolean | Records number of units on hand |
| tracks_costs | boolean | Records cost per unit and total cost |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
