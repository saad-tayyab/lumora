---
id: CON-FIN-422
name: Direct Labor Rate for Services
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

# Direct Labor Rate for Services

## Definition

The hourly rate charged for professional staff time in service businesses, used to calculate direct labor costs for each job.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| application | string | Hours worked × hourly rate = direct labor cost per job |
| example | string | $180 per hour for professional consulting staff |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
