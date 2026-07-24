---
id: CON-FIN-566
name: Profit Center
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

# Profit Center

## Definition

A responsibility center where the manager is responsible for both revenues and costs (and thus profit). Performance is evaluated by comparing operating income to budget.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| manager_responsibility | string | Control over revenues and costs |
| performance_metric | string | Operating income compared to budget |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
