---
id: CON-FIN-238
name: Lease
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

# Lease

## Definition

A contract where the lessor grants the lessee the right to use an asset for a period of time in exchange for payments. Classified as finance leases or operating leases.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v7 | Unique identifier |
| lease_type | string | Finance lease or operating lease |
| term_months | integer | Duration of the lease in months |
| payment_amount | decimal | Periodic lease payment amount |

## Source

- Extracted from accounting textbook
- Chapter range: 1-72
