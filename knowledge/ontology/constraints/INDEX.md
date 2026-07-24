---
title: Constraints Index
version: 1.0.0
status: active
last_updated: 2026-07-24
---

# Constraints Index

## BC-AUTH Constraints (6)

| ID | Concept | Attribute | Type | Description |
|----|---------|-----------|------|-------------|
| CTR-AUTH-001 | CON-AUTH-001 (User) | email | unique | Email addresses must be unique within a tenant |
| CTR-AUTH-002 | CON-AUTH-001 (User) | username | unique | Usernames must be unique within a tenant |
| CTR-AUTH-003 | CON-AUTH-001 (User) | deleted_at | invariant | Soft deletion is mandatory for all user-facing entities |
| CTR-AUTH-004 | CON-AUTH-002 (Role) | name | unique | Role names must be unique within a tenant |
| CTR-AUTH-005 | CON-AUTH-008 (AuditLog) | id | invariant | Audit logs are append-only and must never be modified or deleted |
| CTR-AUTH-006 | CON-AUTH-001 (User) | id | invariant | Every action must be attributable to a user or system process |

## BC-INV Constraints (7)

| ID | Concept | Attribute | Type | Description |
|----|---------|-----------|------|-------------|
| CTR-INV-001 | CON-INV-001 (Item) | sku | unique | SKU codes must be unique within a tenant |
| CTR-INV-002 | CON-INV-001 (Item) | category_id | required | Items must belong to exactly one item category |
| CTR-INV-003 | CON-INV-005 (StockLevel) | quantity_on_hand | invariant | Stock quantity cannot go negative unless explicitly allowed |
| CTR-INV-004 | CON-INV-003 (StockMovement) | source_document_id | required | Every stock movement must reference a source document |
| CTR-INV-005 | CON-INV-002 (ItemCategory) | code | unique | Category codes must be unique within a tenant |
| CTR-INV-006 | CON-INV-005 (StockLevel) | composite_key | unique | StockLevel unique per item-warehouse-tenant |
| CTR-INV-007 | CON-INV-004 (Warehouse) | code | unique | Warehouse codes must be unique within a tenant |

## Files

- [CTR-INV-001](constraints/CTR-INV-001.unique-item-sku.md)
- [CTR-INV-002](constraints/CTR-INV-002.item-category-required.md)
- [CTR-INV-003](constraints/CTR-INV-003.non-negative-stock.md)
- [CTR-INV-004](constraints/CTR-INV-004.source-document-required.md)
- [CTR-INV-005](constraints/CTR-INV-005.unique-category-code.md)
- [CTR-INV-006](constraints/CTR-INV-006.unique-stock-level.md)
- [CTR-INV-007](constraints/CTR-INV-007.unique-warehouse-code.md)
