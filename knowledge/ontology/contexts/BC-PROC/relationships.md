---
id: BC-PROC
name: Procurement Relationships
context: BC-PROC
version: 1.0.0
status: active
---

# BC-PROC Relationships

This file documents all relationships within the Procurement bounded context.

## Internal Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-PROC-001 | CON-PROC-001 (Vendor) | CON-PROC-002 (PurchaseOrder) | has-many | 1:N | Vendor receives purchase orders |
| REL-PROC-002 | CON-PROC-002 (PurchaseOrder) | CON-PROC-003 (POLineItem) | has-many | 1:N | PO contains line items |
| REL-PROC-003 | CON-PROC-003 (POLineItem) | CON-PROC-005 (VendorCatalogItem) | uses | N:1 | Line item references catalog item |
| REL-PROC-004 | CON-PROC-002 (PurchaseOrder) | CON-PROC-004 (ReceivingReport) | has-many | 1:N | PO has receiving reports |
| REL-PROC-005 | CON-PROC-002 (PurchaseOrder) | CON-PROC-006 (POStatus) | uses | 1:1 | PO has a status |
| REL-PROC-006 | CON-PROC-010 (CreatePurchaseOrder) | CON-PROC-007 (PurchaseOrderCreated) | triggers | 1:1 | Command produces event |
| REL-PROC-007 | CON-PROC-011 (ApprovePurchaseOrder) | CON-PROC-008 (PurchaseOrderApproved) | triggers | 1:1 | Command produces event |
| REL-PROC-008 | CON-PROC-012 (ReceiveGoods) | CON-PROC-009 (GoodsReceived) | triggers | 1:1 | Command produces event |
| REL-PROC-009 | CON-PROC-013 (VendorQualificationPolicy) | CON-PROC-001 (Vendor) | enforces | 1:N | Policy governs vendors |
| REL-PROC-010 | CON-PROC-014 (POApprovalPolicy) | CON-PROC-002 (PurchaseOrder) | enforces | 1:N | Policy governs POs |

## Cross-Context Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-CROSS-PROC-001 | CON-PROC-009 (GoodsReceived) | BC-INV: StockAdjusted | triggers | 1:1 | Goods receipt triggers inventory update |
| REL-CROSS-PROC-002 | CON-PROC-004 (ReceivingReport) | BC-AP: VendorInvoice | uses | N:1 | Three-way matching with AP |
| REL-CROSS-PROC-003 | CON-PROC-002 (PurchaseOrder) | BC-FIN: BudgetCommitment | triggers | 1:1 | PO creation commits budget |
