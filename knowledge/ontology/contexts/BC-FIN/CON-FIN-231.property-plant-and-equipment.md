---
id: CON-FIN-231
name: Property, Plant, and Equipment
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Property, Plant, and Equipment

## Definition

A balance sheet classification for tangible fixed assets used in operations. Includes land, buildings, equipment, and land improvements.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| land | Money | Cost of land used in operations |
| buildings | Money | Cost of buildings used in operations |
| equipment | Money | Cost of machinery and equipment used in operations |
| land_improvements | Money | Cost of improvements to land with limited useful lives |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
