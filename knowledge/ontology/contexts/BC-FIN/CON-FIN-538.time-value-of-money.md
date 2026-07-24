---
id: CON-FIN-538
name: Time Value of Money
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

# Time Value of Money

## Definition

The concept that a dollar today is worth more than a dollar in the future because today's dollar can earn interest through investment.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| present_amount | decimal | Value of money at the current time |
| future_amount | decimal | Value of money at a future date |
| interest_rate | decimal | Rate at which money grows over time |
| time_period | integer | Number of periods for compounding |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
