---
id: CON-FIN-567
name: Investment Center
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

# Investment Center

## Definition

A responsibility center where the manager controls revenues, costs, and invested assets. Performance is evaluated using return on investment (ROI) and residual income.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| manager_responsibility | string | Control over revenues, costs, and invested assets |
| performance_metrics | array | ROI and residual income |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
