---
title: BC-BUDGET Relationships
version: 1.0.0
status: active
context: BC-BUDGET
---

# BC-BUDGET (Budget Management) — Relationships

## Intra-Context Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-BUDGET-001 | CON-BUDGET-001 (Budget Header) | CON-BUDGET-002 (Budget Line) | has-many | 1:N | A budget header contains many budget lines |
| REL-BUDGET-002 | CON-BUDGET-002 (Budget Line) | CON-BUDGET-003 (Budget Consumption) | has-many | 1:N | A budget line tracks many consumption records |
| REL-BUDGET-003 | CON-BUDGET-002 (Budget Line) | CON-BUDGET-004 (Budget Variance) | computes | 1:1 | A budget line computes one variance |
| REL-BUDGET-004 | CON-BUDGET-001 (Budget Header) | CON-BUDGET-005 (Budget Period) | uses | N:1 | A budget header spans a budget period |

## Cross-Context Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-BUDGET-005 | CON-BUDGET-002 (Budget Line) | BC-FIN (Account) | uses | N:1 | Each budget line links to a GL account |
| REL-BUDGET-006 | CON-BUDGET-003 (Budget Consumption) | BC-FIN (Journal Entry) | uses | N:1 | Consumption may originate from a journal entry |
| REL-BUDGET-007 | CON-BUDGET-003 (Budget Consumption) | BC-PROC (Purchase Order) | uses | N:1 | Consumption may originate from a purchase order |
| REL-BUDGET-008 | CON-BUDGET-003 (Budget Consumption) | BC-AP (Bill) | uses | N:1 | Consumption may originate from a vendor bill |
| REL-BUDGET-009 | CON-BUDGET-001 (Budget Header) | BC-FIN (Accounting Period) | uses | N:1 | Budget header spans an accounting period |

## Aggregate Boundaries

| Aggregate Root | Child Entities | Value Objects |
|---------------|---------------|---------------|
| CON-BUDGET-001 (Budget Header) | CON-BUDGET-002 (Budget Line) | CON-BUDGET-004 (Budget Variance), CON-BUDGET-005 (Budget Period) |
| CON-BUDGET-003 (Budget Consumption) | — | — |

## References

- [Domain Constitution - BC-BUDGET](../../../../constitution/DOMAIN.md)
- [Ontology Standards](../../STANDARDS.md)
