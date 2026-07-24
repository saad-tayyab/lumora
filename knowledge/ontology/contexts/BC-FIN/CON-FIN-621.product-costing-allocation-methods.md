---
id: CON-FIN-621
name: Product Costing Allocation Methods
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

# Product Costing Allocation Methods

## Definition

Methods used to allocate manufacturing overhead costs to products, including traditional volume-based methods (direct labor hours, machine hours) and activity-based costing (ABC).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| allocation_base | String | The measure used to assign costs (e.g., direct labor hours, machine hours, units) |
| method_type | String | Traditional (volume-based) or Activity-Based Costing (ABC) |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
