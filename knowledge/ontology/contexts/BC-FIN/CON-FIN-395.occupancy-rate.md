---
id: CON-FIN-395
name: Occupancy Rate
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

# Occupancy Rate

## Definition

A measure of capacity utilization calculated as guest nights divided by available room nights, expressed as a percentage.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| formula | string | Occupancy Rate = Guest Nights / Available Room Nights |
| application | string | Hospitality industry capacity measurement |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
