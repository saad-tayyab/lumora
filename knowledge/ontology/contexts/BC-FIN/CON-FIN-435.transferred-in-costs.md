---
id: CON-FIN-435
name: Transferred-In Costs
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

# Transferred-In Costs

## Definition

Costs from a prior department that are carried forward when units move to the next department in a multi-department process. These costs are treated as a separate cost category similar to direct materials.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| source_department | string | The department from which costs were transferred |
| cost_amount | decimal | Costs transferred from the prior department |
| units_transferred | integer | Number of units transferred in |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
