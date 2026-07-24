---
id: REL-ASSET-08
source: CON-ASSET-004
target: CON-FIN-055
type: uses
cardinality: "N:1"
required: true
description: "Depreciation entries must reference an open accounting period"
version: 1.0.0
status: active
---

# REL-ASSET-08: DepreciationEntry uses AccountingPeriod

## Source

- **CON-ASSET-004** (DepreciationEntry) — Entity

## Target

- **CON-FIN-055** (AccountingPeriod) — Aggregate root

## Description

Depreciation entries must reference an open accounting period. Depreciation cannot be posted to closed periods, ensuring temporal consistency of financial records.

## Constraints

- INV-ASSET-002: Depreciation entries must reference an open accounting period.
- INV-FIN-002: Closed accounting periods cannot be modified.
- INV-ASSET-011: Depreciation must be posted before period close.
