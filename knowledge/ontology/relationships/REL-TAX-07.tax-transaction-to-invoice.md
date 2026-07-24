---
id: REL-TAX-007
source: CON-TAX-004
target: CON-AP-003
type: uses
cardinality: "N:1"
required: true
description: "Tax transactions are calculated on AP bill line items"
version: 1.0.0
status: active
---

# REL-TAX-007: TaxTransaction uses Bill

## Source

- **CON-TAX-004** (TaxTransaction) — Entity

## Target

- **CON-AP-003** (Bill) — Aggregate root

## Description

Tax transactions are calculated on AP bill line items. When a bill is created, tax transactions are generated for each taxable line item based on the applicable tax codes and rates.

## Constraints

- INV-TAX-002: Tax transactions must snapshot the rate at time of calculation.
- BR-015: Tax amount is calculated and snapshotted at transaction time.
- BR-017: Expired tax rates cannot be applied to new transactions.
