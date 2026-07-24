---
id: REL-PROC-004
source: CON-PROC-002
target: CON-PROC-004
type: has-many
cardinality: "1:N"
required: false
description: "A purchase order may have multiple receiving reports"
version: 1.0.0
status: active
---

# REL-PROC-004: PurchaseOrder has ReceivingReports

## Source
- **CON-PROC-002** (PurchaseOrder)

## Target
- **CON-PROC-004** (ReceivingReport)

## Description
A purchase order may have zero or more receiving reports. Partial receipts generate multiple receiving reports over time.

## Invariants
- INV-PROC-013: Receiving report must reference a valid purchase order.
