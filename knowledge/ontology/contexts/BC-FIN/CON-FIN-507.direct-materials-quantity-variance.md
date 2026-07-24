---
id: CON-FIN-507
name: Direct Materials Quantity Variance
context: BC-FIN
type: value_object
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Direct Materials Quantity Variance

## Definition

The difference between the actual quantity of direct materials used and the standard quantity that should have been used for the actual production, multiplied by the standard price.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| actual_quantity | decimal | Actual quantity of material used |
| standard_quantity | decimal | Standard quantity allowed for actual production |
| standard_price | decimal | Standard price per unit of material |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
