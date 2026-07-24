---
id: CON-FIN-605
name: Direct Costs
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

# Direct Costs

## Definition

Costs that can be easily and economically traced to a specific cost object.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_object | string | The item being costed |
| traceability | boolean | Can be directly traced to the cost object |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
