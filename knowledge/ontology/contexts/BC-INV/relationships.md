---
title: BC-INV Relationships
version: 1.0.0
status: active
---

# BC-INV Relationships

## Summary

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-INV-001 | CON-INV-001 (Item) | CON-INV-002 (ItemCategory) | belongs-to | N:1 | Item belongs to exactly one category |
| REL-INV-002 | CON-INV-001 (Item) | CON-INV-005 (StockLevel) | has-many | 1:N | Item has stock levels across warehouses |
| REL-INV-003 | CON-INV-001 (Item) | CON-INV-003 (StockMovement) | has-many | 1:N | Item has many stock movements |
| REL-INV-004 | CON-INV-001 (Item) | CON-INV-008 (UnitOfMeasure) | uses | N:1 | Item uses a unit of measure |
| REL-INV-005 | CON-INV-001 (Item) | CON-INV-006 (SKU) | has-one | 1:1 | Item has a unique SKU |
| REL-INV-006 | CON-INV-001 (Item) | CON-INV-007 (ReorderPoint) | has-one | 0:1 | Item may have a reorder point |
| REL-INV-007 | CON-INV-003 (StockMovement) | CON-INV-001 (Item) | belongs-to | N:1 | Movement belongs to an item |
| REL-INV-008 | CON-INV-003 (StockMovement) | CON-INV-004 (Warehouse) | belongs-to | N:1 | Movement occurs in a warehouse |
| REL-INV-009 | CON-INV-004 (Warehouse) | CON-INV-005 (StockLevel) | has-many | 1:N | Warehouse has stock levels |
| REL-INV-010 | CON-INV-004 (Warehouse) | CON-INV-003 (StockMovement) | has-many | 1:N | Warehouse has many movements |
| REL-INV-011 | CON-INV-005 (StockLevel) | CON-INV-001 (Item) | belongs-to | N:1 | Stock level is for an item |
| REL-INV-012 | CON-INV-005 (StockLevel) | CON-INV-004 (Warehouse) | belongs-to | N:1 | Stock level is in a warehouse |
| REL-INV-013 | CON-INV-002 (ItemCategory) | CON-INV-001 (Item) | has-many | 1:N | Category contains items |
| REL-INV-014 | CON-INV-002 (ItemCategory) | CON-INV-002 (ItemCategory) | self-reference | 0:N | Category hierarchy |
| REL-INV-015 | CON-INV-008 (UnitOfMeasure) | CON-INV-008 (UnitOfMeasure) | self-reference | 0:1 | Base UOM for conversion |
| REL-INV-016 | CON-INV-013 (CreateItem) | CON-INV-001 (Item) | creates | 1:1 | Command creates an Item |
| REL-INV-017 | CON-INV-013 (CreateItem) | CON-INV-009 (ItemCreated) | produces | 1:1 | Command produces event |
| REL-INV-018 | CON-INV-014 (AdjustStock) | CON-INV-003 (StockMovement) | creates | 1:1 | Command creates a StockMovement |
| REL-INV-019 | CON-INV-014 (AdjustStock) | CON-INV-010 (StockAdjusted) | produces | 1:1 | Command produces event |
| REL-INV-020 | CON-INV-015 (TransferStock) | CON-INV-003 (StockMovement) | creates | 1:2 | Command creates two StockMovements |
| REL-INV-021 | CON-INV-015 (TransferStock) | CON-INV-010 (StockAdjusted) | produces | 2:2 | Command produces two events |
| REL-INV-022 | CON-INV-016 (NegativeStockPolicy) | CON-INV-005 (StockLevel) | validates | 1:N | Policy validates stock levels |
| REL-INV-023 | CON-INV-016 (NegativeStockPolicy) | CON-INV-003 (StockMovement) | constrains | 1:N | Policy constrains movements |
| REL-INV-024 | CON-INV-017 (ReorderPointPolicy) | CON-INV-007 (ReorderPoint) | evaluates | 1:N | Policy evaluates reorder points |
| REL-INV-025 | CON-INV-017 (ReorderPointPolicy) | CON-INV-012 (ReorderTriggered) | produces | 1:N | Policy produces events |

## Cross-Context Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-INV-X01 | CON-INV-010 (StockAdjusted) | BC-FIN (Journal Entry) | triggers | Stock adjustment triggers financial posting |
| REL-INV-X02 | CON-INV-010 (StockAdjusted) | BC-REPORT (Inventory Report) | updates | Stock adjustment updates reports |
| REL-INV-X03 | CON-INV-012 (ReorderTriggered) | BC-PROC (Purchase Suggestion) | triggers | Reorder trigger initiates procurement |
