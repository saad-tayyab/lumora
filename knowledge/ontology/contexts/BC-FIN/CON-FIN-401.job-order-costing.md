---
id: CON-FIN-401
name: Job Order Costing
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

# Job Order Costing

## Definition

A cost accounting system that accumulates manufacturing costs separately for each job or batch of production. Used when products are manufactured to customers' specifications or in distinct jobs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| job_number | string | Unique identifier assigned to each job |
| direct_materials | decimal | Materials traced directly to a specific job |
| direct_labor | decimal | Labor costs traced directly to a specific job |
| manufacturing_overhead | decimal | Overhead costs applied to the job using a predetermined rate |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
