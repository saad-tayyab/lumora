---
id: CON-FIN-525
name: Opportunity Cost
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

# Opportunity Cost

## Definition

The revenue forgone from an alternative use of an asset, such as cash or equipment, which is not recorded in accounting records but is relevant for decision-making.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| forgone_revenue | decimal | Revenue from best alternative use |
| description | string | Description of the forgone opportunity |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
