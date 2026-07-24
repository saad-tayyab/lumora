---
id: REL-PROC-008
source: CON-PROC-012
target: CON-PROC-009
type: triggers
cardinality: "1:1"
required: true
description: "ReceiveGoods command produces GoodsReceived event"
version: 1.0.0
status: active
---

# REL-PROC-008: ReceiveGoods triggers GoodsReceived

## Source
- **CON-PROC-012** (ReceiveGoods)

## Target
- **CON-PROC-009** (GoodsReceived)

## Description
When the ReceiveGoods command successfully confirms receipt, it produces a GoodsReceived domain event.

## Invariants
- INV-PROC-024: The event must reference a valid receiving report ID.
- INV-PROC-025: The receiving report must be in "confirmed" status when emitted.
