---
id: CON-FIN-252
name: Goodwill
context: BC-FIN
type: entity
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Goodwill

## Definition

An intangible asset created from favorable factors such as location, product quality, reputation, and managerial skill. Recorded only when purchased in excess of fair value of net assets. Not amortized; tested for impairment.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| purchase_price_excess | decimal | Excess of purchase price over fair value of net assets acquired |
| impairment_loss | decimal | Loss recognized when fair value is less than carrying value |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
