---
id: CON-FIN-404
name: Job
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

# Job

## Definition

Each quantity of product that is manufactured in a job order costing system. Each job is uniquely tracked for its costs.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| identification | string | Each job has a unique job number |
| cost_tracking | string | Costs accumulated separately for each job |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
