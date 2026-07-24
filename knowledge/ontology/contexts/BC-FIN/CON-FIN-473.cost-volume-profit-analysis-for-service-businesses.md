---
id: CON-FIN-473
name: Cost-Volume-Profit Analysis for Service Businesses
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

# Cost-Volume-Profit Analysis for Service Businesses

## Definition

Application of CVP analysis techniques to service organizations, where the 'product' is a service and costs are classified as variable and fixed based on service volume.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| service_units | string | Measure of service volume (e.g., patient days, rides given) |
| variable_service_costs | array | Costs that vary with service volume |
| fixed_service_costs | array | Costs that remain constant regardless of service volume |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
