---
id: REL-PROC-007
source: CON-PROC-011
target: CON-PROC-008
type: triggers
cardinality: "1:1"
required: true
description: "ApprovePurchaseOrder command produces PurchaseOrderApproved event"
version: 1.0.0
status: active
---

# REL-PROC-007: ApprovePurchaseOrder triggers PurchaseOrderApproved

## Source
- **CON-PROC-011** (ApprovePurchaseOrder)

## Target
- **CON-PROC-008** (PurchaseOrderApproved)

## Description
When the ApprovePurchaseOrder command successfully passes the POApprovalPolicy, it produces a PurchaseOrderApproved domain event.

## Invariants
- INV-PROC-022: The event must reference a valid PO ID.
- INV-PROC-023: The PO must be in "pending_approval" status when emitted.
