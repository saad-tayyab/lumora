---
id: CTR-PROC-002
concept: CON-PROC-002
attribute: po_number
type: unique
scope: tenant_id
description: "PO numbers must be unique within a tenant"
severity: error
version: 1.0.0
status: active
---

# CTR-PROC-002: Unique PO Number

## Concept
- **CON-PROC-002** (PurchaseOrder)

## Attribute
- `po_number`

## Constraint
Purchase order numbers must be unique within a tenant. No two purchase orders may share the same number.

## Rationale
PO numbers are the primary human-readable identifier for procurement transactions. Uniqueness is essential for reference in three-way matching and audit trails.
