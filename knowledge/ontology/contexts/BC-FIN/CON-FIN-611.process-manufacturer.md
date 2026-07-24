---
id: CON-FIN-611
name: Process Manufacturer
context: BC-FIN
type: role
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Process Manufacturer

## Definition

A company that uses process costing to produce homogeneous products through continuous manufacturing processes. Examples include oil refineries, chemical plants, and food processing companies.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| cost_flow | String | Cost flow pattern through Work in Process and Finished Goods |
| physical_flow | String | Physical movement of materials through the production process |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
