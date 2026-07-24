---
id: REL-PROC-003
source: CON-PROC-003
target: CON-PROC-005
type: uses
cardinality: "N:1"
required: false
description: "A line item may reference a vendor catalog item"
version: 1.0.0
status: active
---

# REL-PROC-003: POLineItem uses VendorCatalogItem

## Source
- **CON-PROC-003** (POLineItem)

## Target
- **CON-PROC-005** (VendorCatalogItem)

## Description
A line item may optionally reference a vendor catalog item to auto-populate pricing and item codes. This relationship is not required — line items can be manually specified.

## Invariants
- None specific to this relationship.
