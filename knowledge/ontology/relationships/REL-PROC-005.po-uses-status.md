---
id: REL-PROC-005
source: CON-PROC-002
target: CON-PROC-006
type: uses
cardinality: "1:1"
required: true
description: "A purchase order has a status value object"
version: 1.0.0
status: active
---

# REL-PROC-005: PurchaseOrder uses POStatus

## Source
- **CON-PROC-002** (PurchaseOrder)

## Target
- **CON-PROC-006** (POStatus)

## Description
Each purchase order has exactly one POStatus value object representing its current lifecycle state.

## Invariants
- INV-PROC-019: Status transitions must follow the defined state machine.
- INV-PROC-020: A PO cannot transition from draft directly to approved.
