---
id: CON-FIN-413
name: Normal Costing
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

# Normal Costing

## Definition

A costing method that assigns direct materials and direct labor at actual cost and manufacturing overhead using a predetermined overhead rate.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| direct_costs | string | Actual cost for DM and DL |
| overhead | string | Applied using predetermined rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
