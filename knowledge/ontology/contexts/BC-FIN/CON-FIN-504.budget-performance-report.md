---
id: CON-FIN-504
name: Budget Performance Report
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

# Budget Performance Report

## Definition

A report comparing actual costs to standard or budgeted costs, showing variances for each cost element to identify areas requiring management attention.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| budgeted_amounts | array | Planned costs at standard |
| actual_amounts | array | Actual costs incurred |
| variances | array | Differences between actual and standard |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
