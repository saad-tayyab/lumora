---
id: CTR-INV-007
concept: CON-INV-004 (Warehouse)
attribute: code
type: unique
scope: tenant_id
description: "Warehouse codes must be unique within a tenant"
severity: error
version: 1.0.0
status: active
---

# CTR-INV-007: Unique Warehouse Code

## Rule
Each Warehouse must have a unique code within its tenant.

## Scope
All active warehouses within a single tenant.

## Violation
Attempting to create or update a warehouse with a code that already exists in the same tenant.
