---
id: CON-CASH-016
name: BankFeePolicy
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
  - fees
  - banking
---

# BankFeePolicy

## Definition
A business policy that defines how bank fees are identified, categorized, and recorded during statement import and reconciliation. Controls automatic fee detection and journal entry creation for bank charges.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| tenant_id | UUID v7 | yes | Tenant isolation identifier |
| policy_name | string(100) | yes | Name of the policy |
| fee_categories | json | yes | Map of fee types to GL accounts |
| auto_detect_fees | boolean | yes | Whether to auto-detect fees from descriptions |
| description_patterns | json | yes | Regex patterns to identify fee transactions |
| default_fee_account | UUID v7 | yes | Default GL account for undetected fees |
| requires_approval | boolean | yes | Whether fee entries require approval |
| effective_from | date | yes | Policy effective start date |
| effective_to | date | no | Policy effective end date (null = active) |
| created_at | timestamp | yes | Record creation timestamp |
| updated_at | timestamp | yes | Last modification timestamp |

## Relationships
| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-CASH-004 (ReconciliationEntry) | processes | 1:N | Fee entries processed under this policy |

## Invariants
- INV-CASH-039: Fee categories must map to valid GL account IDs.
- INV-CASH-040: Description patterns must be valid regular expressions.
- INV-CASH-041: Effective from must be before effective to (if provided).
- INV-CASH-042: Only one policy can be active per tenant at a time.

## Business Rules
- No business rules directly defined for this policy.

## Events
- None (policies do not emit events)

## References
- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#5-business-rules-registry)
- [BC-CASH Bounded Context](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
