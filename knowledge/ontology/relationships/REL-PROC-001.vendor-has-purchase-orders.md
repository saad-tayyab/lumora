---
id: REL-PROC-001
source: CON-PROC-001
target: CON-PROC-002
type: has-many
cardinality: "1:N"
required: true
description: "A vendor receives multiple purchase orders"
version: 1.0.0
status: active
---

# REL-PROC-001: Vendor has PurchaseOrders

## Source
- **CON-PROC-001** (Vendor)

## Target
- **CON-PROC-002** (PurchaseOrder)

## Description
A single vendor can receive many purchase orders over time. Each purchase order is issued to exactly one vendor.

## Invariants
- INV-PROC-002: A vendor with active purchase orders cannot be deactivated.
