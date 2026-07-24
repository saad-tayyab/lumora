---
id: CON-FIN-462
name: Relevant Range
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

# Relevant Range

## Definition

The range of activity (e.g., machine hours, units) within which the assumptions about fixed and variable cost behavior are valid. Outside this range, cost behavior may change.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| lower_bound | decimal | Minimum activity level for valid cost assumptions |
| upper_bound | decimal | Maximum activity level for valid cost assumptions |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
