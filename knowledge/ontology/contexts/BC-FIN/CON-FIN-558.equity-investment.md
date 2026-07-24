---
id: CON-FIN-558
name: Equity Investment
context: BC-FIN
type: aggregate
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Equity Investment

## Definition

An investment in the preferred or common stock of another company. The accounting method depends on the percentage of ownership: fair value method (<20%), equity method (20%-50%), or consolidation (>50%).

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| investor | string | The company making the investment |
| investee | string | The company whose stock is purchased |
| ownership_percentage | decimal | Percentage of outstanding stock acquired |
| initial_cost | decimal | Cost of the investment |
| accounting_method | string | Fair value method or equity method based on ownership |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
