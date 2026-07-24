---
id: CON-FIN-510
name: Manufacturing Overhead Cost Variance Report
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

# Manufacturing Overhead Cost Variance Report

## Definition

A detailed report separating manufacturing overhead variances into controllable and volume variances, showing budgeted and actual overhead costs by element for management control.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| controllable_variance | decimal | Net controllable variance amount |
| volume_variance | decimal | Volume variance amount |
| total_variance | decimal | Total manufacturing overhead variance |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
