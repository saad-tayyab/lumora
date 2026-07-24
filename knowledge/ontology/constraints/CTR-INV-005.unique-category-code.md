---
id: CTR-INV-005
concept: CON-INV-002 (ItemCategory)
attribute: code
type: unique
scope: tenant_id
description: "Category codes must be unique within a tenant"
severity: error
version: 1.0.0
status: active
---

# CTR-INV-005: Unique Category Code

## Rule
Each ItemCategory must have a unique code within its tenant.

## Scope
All active categories within a single tenant.

## Violation
Attempting to create or update a category with a code that already exists in the same tenant.
