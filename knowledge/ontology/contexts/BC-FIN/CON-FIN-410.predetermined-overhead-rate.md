---
id: CON-FIN-410
name: Predetermined Overhead Rate
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

# Predetermined Overhead Rate

## Definition

The rate used to apply manufacturing overhead costs to the goods manufactured. The rate is determined by dividing the estimated total manufacturing overhead costs by the estimated activity base at the beginning of the fiscal period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| estimated_overhead | Money | Estimated total manufacturing overhead |
| estimated_activity_base | number | Estimated activity level |
| rate | number | Calculated overhead rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
