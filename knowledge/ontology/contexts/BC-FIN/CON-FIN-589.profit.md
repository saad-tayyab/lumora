---
id: CON-FIN-589
name: Profit
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

# Profit

## Definition

The difference between the amounts received from customers for goods or services provided and the amounts paid for the inputs used to provide the goods or services.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| revenue | Money | Amounts received from customers |
| expenses | Money | Amounts paid for inputs |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
