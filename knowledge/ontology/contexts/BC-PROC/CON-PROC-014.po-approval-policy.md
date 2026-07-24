---
id: CON-PROC-014
name: POApprovalPolicy
context: BC-PROC
type: policy
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - procurement
  - purchase-order
  - policy
---

# POApprovalPolicy

## Definition

A business policy that defines the approval requirements for Purchase Orders based on amount thresholds and organizational authority. This policy ensures proper authorization before procurement commitments are made.

## Policy Rules

| Rule | Description |
|------|-------------|
| PO-APPROVAL-001 | POs under $1,000 may be auto-approved by the system. |
| PO-APPROVAL-002 | POs between $1,000 and $10,000 require department manager approval. |
| PO-APPROVAL-003 | POs between $10,000 and $50,000 require director approval. |
| PO-APPROVAL-004 | POs over $50,000 require VP or CFO approval. |
| PO-APPROVAL-005 | The approver cannot be the same person who created the PO. |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-PROC-002 (PurchaseOrder) | governs | N:1 | Policy applies to POs |
| CON-PROC-011 (ApprovePurchaseOrder) | enforces | 1:N | Policy enforced during PO approval |

## Invariants

- INV-PROC-035: A PO must meet all applicable approval rules before the status can transition to "approved".

## Business Rules

- Approval thresholds are configurable per tenant.
- The system validates the approver's role and authority against the PO amount.
- Self-approval is prohibited (PO-APPROVAL-005).

## References

- [Domain Constitution](../../../../knowledge/constitution/DOMAIN.md#4-domain-invariants)
- [BC-PROC Definition](../../../../knowledge/constitution/DOMAIN.md#3-core-bounded-contexts)
