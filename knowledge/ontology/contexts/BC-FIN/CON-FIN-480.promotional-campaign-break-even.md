---
id: CON-FIN-480
name: Promotional Campaign Break-Even
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

# Promotional Campaign Break-Even

## Definition

Computing the number of new customer accounts needed to recover the cost of a promotional campaign, treating the campaign cost as a fixed cost and the lifetime contribution margin per customer as the unit contribution margin.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| campaign_cost | decimal | Total fixed cost of the promotional campaign |
| customer_lifetime_months | integer | Average number of months a new customer stays subscribed |
| monthly_contribution_margin | decimal | Revenue per month minus variable cost per month per account |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
