---
id: REL-ASSET-07
source: CON-ASSET-004
target: CON-FIN-011
type: uses
cardinality: "N:1"
required: true
description: "Depreciation entries post to the general ledger via journal entries"
version: 1.0.0
status: active
---

# REL-ASSET-07: DepreciationEntry uses JournalEntry

## Source

- **CON-ASSET-004** (DepreciationEntry) — Entity

## Target

- **CON-FIN-011** (JournalEntry) — Aggregate root

## Description

Depreciation entries post to the general ledger via journal entries. Each depreciation entry creates a corresponding journal entry to record the depreciation expense and accumulated depreciation in the general ledger.

## Constraints

- INV-ASSET-002: Depreciation entries must reference an open accounting period.
- INV-FIN-001: Every journal entry must balance (total debits = total credits).
- INV-FIN-003: Every financial transaction must have an audit trail.
