---
id: CTR-PROC-001
concept: CON-PROC-001
attribute: code
type: unique
scope: tenant_id
description: "Vendor codes must be unique within a tenant"
severity: error
version: 1.0.0
status: active
---

# CTR-PROC-001: Unique Vendor Code

## Concept
- **CON-PROC-001** (Vendor)

## Attribute
- `code`

## Constraint
Vendor codes must be unique within a tenant. No two vendors may share the same code within the same tenant.

## Rationale
Vendor codes are used as human-readable identifiers for reference in purchase orders, invoices, and reports. Uniqueness prevents confusion and lookup errors.
