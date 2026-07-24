---
id: CTR-BUDGET-001
name: Budget Line Sum
context: BC-BUDGET
type: invariant
description: "Sum of budget line amounts must equal the budget header total budget amount"
severity: error
version: 1.0.0
status: active
---

# CTR-BUDGET-001: Budget Line Sum

## Statement

Sum of budget line amounts must equal the budget header total budget amount.

## Rationale

Ensures the budget is fully allocated across its lines with no unaccounted or surplus amounts. Maintains internal consistency between header-level and line-level data.

## Implementation

- Validate on budget save/submit that `SUM(budget_lines.amount) = budget_header.total_amount`.
- Reject budgets where the line total does not match the header total.

## Invariant Reference

- INV-BUDGET-003: Budget line amounts must sum to the header total.
