---
id: CON-FIN-420
name: Cost Comparison
context: BC-FIN
type: process
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Cost Comparison

## Definition

Analyzing job costs by comparing direct materials, direct labor, and overhead across different jobs to identify patterns and anomalies.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| comparison_targets | string | Similar jobs, different time periods, estimated vs actual |
| focus_areas | string | Materials quantity/price, labor hours/rate, overhead application |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
