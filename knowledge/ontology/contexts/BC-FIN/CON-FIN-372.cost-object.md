---
id: CON-FIN-372
name: Cost Object
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

# Cost Object

## Definition

Anything to which costs are assigned, which varies depending upon the decision-making needs of management. Examples include products, sales territories, departments, or activities.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| examples | string | Product, sales territory, department, activity (e.g., research and development) |
| flexibility | string | Defined based on management's decision-making needs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
