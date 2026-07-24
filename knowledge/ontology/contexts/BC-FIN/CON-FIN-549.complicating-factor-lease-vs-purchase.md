---
id: CON-FIN-549
name: Complicating Factor — Lease vs. Purchase
context: BC-FIN
type: policy
version: 1.0.0
status: active
owners:
  - Knowledge Agent
tags:
  - accounting
  - financial
---

# Complicating Factor — Lease vs. Purchase

## Definition

The decision to lease or purchase a fixed asset involves comparing the costs and benefits of each option, where leasing avoids large cash outlays but is normally more costly over time.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| lease_payments | decimal | Annual lease payment amount |
| purchase_cost | decimal | Upfront cost to purchase the asset |
| lease_advantages | array | Lower initial outlay, no obsolescence risk, tax deductibility |
| lease_disadvantages | array | Higher total cost including lessor profit |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
