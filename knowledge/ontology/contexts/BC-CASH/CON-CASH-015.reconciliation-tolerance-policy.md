---
id: CON-CASH-015
name: ReconciliationTolerancePolicy
context: BC-CASH
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - cash
  - treasury
  - policy
  - reconciliation
  - tolerance
---

# ReconciliationTolerancePolicy

## Definition
A business policy that defines the tolerance thresholds for automatic bank reconciliation matching. Determines when a bank statement entry can be automatically matched to an internal record based on amount difference. Implements BR-008 from the Domain Constitution.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| policy_name | string(100) | yes | Name of the policy |
| default_tolerance | numeric(19,4) | yes | Default tolerance amount |
| tolerance_type | enum | yes | Absolute, Percentage |
| tolerance_value | numeric(19,4) | yes | Tolerance value (amount or percentage) |
| max_auto_match_confidence | numeric(5,4) | yes | Minimum confidence for auto-match |
| currency_specific | boolean | no | Whether tolerances vary by currency |
| effective_from | date | yes | Policy effective start date |
| effective_to | date | no | Policy effective end date (null = active) |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-005 (ReconciliationMatch) | enforces | 1:N | Tolerance applied to matches |
| CON-CASH-014 (ReconcileAccount) | guides | 1:N | Reconciliation uses this policy |

## Invariants
- INV-CASH-035: Tolerance value must be non-negative.
- INV-CASH-036: Max auto-match confidence must be between 0.0 and 1.0.
- INV-CASH-037: Effective from must be before effective to (if provided).
- INV-CASH-038: Only one policy can be active per tenant at a time.

## Business Rules
- BR-008: Bank reconciliation requires matching with tolerance — this policy defines the tolerance parameters.

## Events
- None (policies do not emit events)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#5-business-rules-registry)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
