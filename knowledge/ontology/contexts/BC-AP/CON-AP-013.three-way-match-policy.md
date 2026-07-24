---
id: CON-AP-013
name: ThreeWayMatchPolicy
context: BC-AP
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - accounts-payable
  - policy
  - matching
  - three-way-match
---

# ThreeWayMatchPolicy

## Definition

Business policy that enforces three-way matching for vendor bills that are linked to a purchase order. The policy requires that the vendor bill, the purchase order, and the receiving report all agree on quantities and prices before the bill can be approved for payment.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| name | string(100) | yes | Policy name |
| tolerance_pct | numeric(5,4) | yes | Acceptable variance percentage (e.g., 0.01 = 1%) |
| tolerance_amount | numeric(19,4) | yes | Acceptable absolute variance amount |
| applies_to | enum | yes | po_linked_bills, all_bills |
| is_active | boolean | yes | Whether policy is currently enforced |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AP-006 (ThreeWayMatchResult) | enforces | 1:N | Policy governs match results |
| CON-AP-003 (Bill) | applies-to | 1:N | Policy applies to bills |

## Invariants

- Tolerance values must be non-negative.
- Policy must be active to be enforced.

## Business Rules

- BR-004: Three-way matching required for PO-based bills.
- If bill is linked to a PO, it must pass three-way match before approval.
- Variances within tolerance are automatically accepted.
- Variances exceeding tolerance require manual review and resolution.

## References

- [Domain Constitution - BC-AP](../../../../constitution/DOMAIN.md)
- [Business Rules Registry - BR-004](../../../../constitution/DOMAIN.md#5-business-rules-registry)
