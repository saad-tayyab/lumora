---
id: CON-FIN-234
name: Cost Principle for Fixed Assets
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

# Cost Principle for Fixed Assets

## Definition

Fixed assets are recorded at cost, which includes all expenditures necessary to acquire the asset and prepare it for its intended use. Includes purchase price, freight, installation, and testing. Costs from errors, vandalism, theft, and fines are expensed, not capitalized.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| included_costs | List | Purchase price, freight, installation, testing, permits |
| excluded_costs | List | Vandalism, installation errors, uninsured theft, damage, fines |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
