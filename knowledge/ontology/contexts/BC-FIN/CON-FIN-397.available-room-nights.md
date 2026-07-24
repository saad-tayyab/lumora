---
id: CON-FIN-397
name: Available Room Nights
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

# Available Room Nights

## Definition

The total number of room-nights available for sale, calculated as number of rooms × number of days in the period.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Available Room Nights = Number of Rooms × Days in Period |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
