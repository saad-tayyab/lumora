---
id: CON-FIN-246
name: Natural Resources
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

# Natural Resources

## Definition

Assets that are naturally occurring, removed for sale, and removed over more than one year. Examples include timber, minerals, and oil. Classified as property, plant, and equipment.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost | decimal | Cost of obtaining and preparing the resource for use |
| estimated_total_units | integer | Estimated total units of the resource |
| units_remaining | integer | Remaining units in the resource |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
