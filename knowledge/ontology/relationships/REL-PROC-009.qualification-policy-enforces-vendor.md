---
id: REL-PROC-009
source: CON-PROC-013
target: CON-PROC-001
type: enforces
cardinality: "1:N"
required: true
description: "VendorQualificationPolicy enforces rules on vendors"
version: 1.0.0
status: active
---

# REL-PROC-009: VendorQualificationPolicy enforces Vendor rules

## Source
- **CON-PROC-013** (VendorQualificationPolicy)

## Target
- **CON-PROC-001** (Vendor)

## Description
The VendorQualificationPolicy governs which vendors are eligible to receive purchase orders. It is enforced during PO creation.

## Invariants
- INV-PROC-034: A vendor must pass all qualification rules before a PO can be created against them.
