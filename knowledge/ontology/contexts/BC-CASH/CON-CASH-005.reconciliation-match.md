---
id: CON-CASH-005
name: ReconciliationMatch
context: BC-CASH
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - reconciliation
  - value-object
  - matching
---

# ReconciliationMatch

## Definition
A value object representing the result of matching a bank statement entry against an internal financial record. Encapsulates the match details including confidence score, tolerance check, and the linked entities.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| statement_entry_id | UUID v7 | yes | Reference to ReconciliationEntry |
| matched_record_id | UUID v7 | yes | ID of matched internal record |
| matched_record_type | string(50) | yes | Type of matched record |
| amount_difference | numeric(19,4) | yes | Absolute difference between amounts |
| tolerance_applied | numeric(19,4) | yes | Tolerance threshold used for match |
| match_type | enum | yes | Exact, WithinTolerance, Manual, Disputed |
| confidence_score | numeric(5,4) | yes | Auto-match confidence (0.0 to 1.0) |
| matched_by | string(50) | yes | Who/what performed the match (system, user_id) |
| matched_at | timestamp | yes | When the match was made |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-004 (ReconciliationEntry) | belongs-to | N:1 | Match for this entry |

## Invariants
- INV-CASH-013: Amount difference must be non-negative.
- INV-CASH-014: Confidence score must be between 0.0 and 1.0.
- INV-CASH-015: Tolerance applied must be non-negative.
- INV-CASH-016: Match type must be consistent with confidence score and tolerance.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance — this value object captures the tolerance logic.

## Events
- None (value objects do not emit events)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#42-inventory-invariants)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
