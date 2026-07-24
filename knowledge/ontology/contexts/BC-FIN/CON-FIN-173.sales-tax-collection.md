---
id: CON-FIN-173
name: Sales Tax Collection
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

# Sales Tax Collection

## Definition

Sales tax collected from customers at the point of sale, which represents a liability owed to the government until remitted. The seller collects the tax on behalf of the taxing authority.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| tax_rate | decimal | Sales tax percentage rate |
| tax_amount | decimal | Tax collected from customer |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
