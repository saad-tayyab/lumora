---
id: CON-FIN-448
name: Activity-Based Costing (ABC)
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Activity-Based Costing (ABC)

## Definition

A costing method that assigns manufacturing overhead and selling/administrative expenses to products based on the activities they consume, using multiple activity rates rather than a single plantwide or departmental rate.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| activity_pools | array | Groups of costs related to specific activities (e.g., fabrication, assembly, setup, quality control, engineering changes) |
| activity_bases | array | Measures that cause activity costs to change (e.g., direct labor hours, setups, inspections, material moves) |
| activity_rates | array | Budgeted activity cost divided by total activity-base usage for each activity |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
