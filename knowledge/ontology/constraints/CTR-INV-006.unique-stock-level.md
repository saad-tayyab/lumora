---
id: CTR-INV-006
concept: CON-INV-005 (StockLevel)
attribute: composite_key
type: unique
scope: tenant_id
description: "The combination of item_id, warehouse_id, and tenant_id must be unique"
severity: error
version: 1.0.0
status: active
---

# CTR-INV-006: Unique StockLevel Per Item-Warehouse

## Rule
There can be only one StockLevel record per (item_id, warehouse_id, tenant_id) combination.

## Scope
All stock levels within a single tenant.

## Violation
Attempting to create a duplicate StockLevel for the same item and warehouse within a tenant.
