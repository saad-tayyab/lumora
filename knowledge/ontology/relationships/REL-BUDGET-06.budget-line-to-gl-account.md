---
id: REL-BUDGET-006
source: CON-BUDGET-002
target: CON-FIN-001
type: uses
cardinality: "N:1"
required: true
description: "Budget lines are allocated per GL account"
version: 1.0.0
status: active
---

# REL-BUDGET-006: BudgetLine uses Account

## Source

- **CON-BUDGET-002** (BudgetLine) — Entity

## Target

- **CON-FIN-001** (Account) — Aggregate root

## Description

Budget lines are allocated per GL account. Each budget line specifies a budget amount for a particular GL account within a budget period, enabling spending control at the account level.

## Constraints

- INV-BUDGET-001: Budget consumption amounts must be non-negative.
- BR-018: Budget consumption is tracked per GL account per period.
