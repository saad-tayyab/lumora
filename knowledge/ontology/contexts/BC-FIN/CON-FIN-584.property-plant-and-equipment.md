---
id: CON-FIN-584
name: Property, Plant and Equipment
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

# Property, Plant and Equipment

## Definition

Tangible long-lived assets used in operations, recorded at cost less accumulated depreciation.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| land_and_improvements | Money | Land and related improvements |
| buildings | Money | Office and manufacturing buildings |
| machinery_and_equipment | Money | Production and operational equipment |
| internal_use_software | Money | Software developed for internal use |
| leasehold_improvements | Money | Improvements to leased properties |
| construction_in_process | Money | Assets under construction not yet placed in service |
| accumulated_depreciation | Money | Total depreciation recorded to date |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
