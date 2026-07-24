---
id: REL-PROC-006
source: CON-PROC-010
target: CON-PROC-007
type: triggers
cardinality: "1:1"
required: true
description: "CreatePurchaseOrder command produces PurchaseOrderCreated event"
version: 1.0.0
status: active
---

# REL-PROC-006: CreatePurchaseOrder triggers PurchaseOrderCreated

## Source
- **CON-PROC-010** (CreatePurchaseOrder)

## Target
- **CON-PROC-007** (PurchaseOrderCreated)

## Description
When the CreatePurchaseOrder command is successfully executed, it produces a PurchaseOrderCreated domain event.

## Invariants
- INV-PROC-021: The event must reference a valid PO ID.
