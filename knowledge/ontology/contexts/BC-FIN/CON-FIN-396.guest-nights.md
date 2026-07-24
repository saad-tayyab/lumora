---
id: CON-FIN-396
name: Guest Nights
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

# Guest Nights

## Definition

The total number of room-nights occupied by guests, calculated as the sum of (number of guests × nights per visit) for each guest category.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Sum of (Guests × Nights per Visit) for all categories |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
