---
id: REL-PROC-002
source: CON-PROC-002
target: CON-PROC-003
type: has-many
cardinality: "1:N"
required: true
description: "A purchase order contains multiple line items"
version: 1.0.0
status: active
---

# REL-PROC-002: PurchaseOrder has POLineItems

## Source
- **CON-PROC-002** (PurchaseOrder)

## Target
- **CON-PROC-003** (POLineItem)

## Description
A purchase order aggregate contains one or more line items. Line items cannot exist independently outside the PO aggregate.

## Invariants
- INV-PROC-003: A PO must have at least one line item to be submitted.
- INV-PROC-004: PO total must equal the sum of all line item amounts plus tax.
