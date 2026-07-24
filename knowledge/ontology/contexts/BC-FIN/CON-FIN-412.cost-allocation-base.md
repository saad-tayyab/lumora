---
id: CON-FIN-412
name: Cost Allocation Base
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

# Cost Allocation Base

## Definition

The measure used to allocate indirect costs to cost objects, such as direct labor hours, machine hours, or sales dollars.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| name | string | Name of the allocation base |
| appropriateness | string | Whether the base accurately reflects cost causation |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
