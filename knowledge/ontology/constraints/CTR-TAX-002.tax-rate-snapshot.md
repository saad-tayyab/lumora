---
id: CTR-TAX-002
name: Tax Rate Snapshot
context: BC-TAX
type: invariant
description: "Tax transaction rate must equal the tax rate effective at transaction time"
severity: error
version: 1.0.0
status: active
---

# CTR-TAX-002: Tax Rate Snapshot

## Statement

Tax transaction rate must equal the tax rate effective at transaction time.

## Rationale

Guarantees that historical tax calculations are reproducible and not affected by later rate changes. Snapshots preserve the rate as it was at the moment of the transaction.

## Implementation

- At transaction creation, resolve the applicable tax rate version using `effective_date <= transaction_date` and `(expiry_date IS NULL OR expiry_date > transaction_date)`.
- Store the resolved rate as a snapshot on the transaction record.
- Never recalculate tax amounts by referencing current rates.

## Invariant Reference

- INV-TAX-002: Tax transactions must snapshot the rate at time of calculation (not reference current rate).

## Business Rule Reference

- BR-015: Tax amount is calculated and snapshotted at transaction time.
