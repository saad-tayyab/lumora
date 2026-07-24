---
id: REL-BUDGET-007
source: CON-BUDGET-003
target: CON-FIN-011
type: tracks
cardinality: "N:1"
required: true
description: "Budget consumption records track actual spending from journal entries"
version: 1.0.0
status: active
---

# REL-BUDGET-007: BudgetConsumption tracks JournalEntry

## Source

- **CON-BUDGET-003** (BudgetConsumption) — Entity

## Target

- **CON-FIN-011** (JournalEntry) — Aggregate root

## Description

Budget consumption records track actual spending from journal entries. When journal entries are posted against budgeted GL accounts, corresponding consumption records are created to measure actual spend against budget allocations.

## Constraints

- INV-BUDGET-001: Budget consumption amounts must be non-negative.
- BR-019: Budget variance is calculated as consumed minus budgeted amount.
- BR-020: Budget consumption reverses when journal entries are voided.
