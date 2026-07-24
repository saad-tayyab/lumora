---
id: CON-FIN-414
name: Actual Costing
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

# Actual Costing

## Definition

A costing method that assigns direct materials, direct labor, and manufacturing overhead all at actual costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| direct_costs | string | Actual cost for DM and DL |
| overhead | string | Actual overhead costs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
