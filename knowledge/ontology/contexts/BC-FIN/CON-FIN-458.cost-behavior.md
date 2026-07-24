---
id: CON-FIN-458
name: Cost Behavior
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

# Cost Behavior

## Definition

The manner in which a cost changes as a related activity changes. Understanding cost behavior is essential for predicting profits as sales and production volumes change.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| activity_base | string | The activity that causes the cost to change (e.g., units produced, miles driven) |
| relevant_range | string | The range of activity over which cost changes are analyzed |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
