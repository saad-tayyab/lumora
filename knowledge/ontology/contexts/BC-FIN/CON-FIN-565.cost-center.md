---
id: CON-FIN-565
name: Cost Center
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Cost Center

## Definition

A responsibility center where the manager is responsible only for costs. Examples include maintenance, accounting, and human resources departments. Performance is evaluated by comparing actual costs to budgeted costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| manager_responsibility | string | Control over costs only |
| performance_metric | string | Variance between actual and budgeted costs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
