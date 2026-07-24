---
id: CON-FIN-405
name: Job Cost Sheet
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

# Job Cost Sheet

## Definition

A form used to record the costs assigned to a specific job. Contains the job number, customer information, and accumulates direct materials, direct labor, and applied manufacturing overhead.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| job_number | string | Unique job identifier |
| customer | string | Customer name or order reference |
| direct_materials | decimal | Total direct materials charged to the job |
| direct_labor | decimal | Total direct labor charged to the job |
| manufacturing_overhead | decimal | Total manufacturing overhead applied to the job |
| total_cost | decimal | Sum of all costs assigned to the job |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
