---
id: CTR-INV-004
concept: CON-INV-003 (StockMovement)
attribute: source_document_id
type: required
scope: movement
description: "Every stock movement must reference a source document"
severity: error
version: 1.0.0
status: active
---

# CTR-INV-004: Source Document Required

## Rule
Every StockMovement must reference a valid source document via source_document_type and source_document_id fields. These fields are mandatory and cannot be null.

## Invariant Reference
INV-INV-002: Every stock movement must reference a source document.

## Violation
Attempting to create a StockMovement without providing source_document_type and source_document_id.
