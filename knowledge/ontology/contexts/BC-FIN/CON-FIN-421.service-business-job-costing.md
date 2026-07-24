---
id: CON-FIN-421
name: Service Business Job Costing
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

# Service Business Job Costing

## Definition

Adaptation of job order costing for service businesses where the primary costs are direct labor and overhead. Costs accumulate in Work in Process and transfer to Cost of Services upon completion.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| primary_costs | string | Direct labor and allocated overhead |
| cost_flow | string | Work in Process → Cost of Services upon completion |
| billing | string | Client billed upon job completion based on accumulated costs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
