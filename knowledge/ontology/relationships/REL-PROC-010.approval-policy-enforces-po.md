---
id: REL-PROC-010
source: CON-PROC-014
target: CON-PROC-002
type: enforces
cardinality: "1:N"
required: true
description: "POApprovalPolicy enforces rules on purchase orders"
version: 1.0.0
status: active
---

# REL-PROC-010: POApprovalPolicy enforces PurchaseOrder rules

## Source
- **CON-PROC-014** (POApprovalPolicy)

## Target
- **CON-PROC-002** (PurchaseOrder)

## Description
The POApprovalPolicy governs the approval requirements for purchase orders based on amount thresholds and organizational authority. It is enforced during PO approval.

## Invariants
- INV-PROC-035: A PO must meet all applicable approval rules before status can transition to "approved".
