---
id: CON-FIN-553
name: Net Present Value of Sequential Revenue Streams
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

# Net Present Value of Sequential Revenue Streams

## Definition

A technique for evaluating investments with multiple sequential revenue phases (e.g., theatrical, home video, pay TV, syndication), where each phase generates cash flows at different points in time.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| production_cost | decimal | Initial cost to produce the asset |
| advertising_cost | decimal | Marketing expenses during initial release |
| revenue_phases | array | Sequence of revenue streams with timing |
| discount_rate | decimal | Desired rate of return for discounting |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
