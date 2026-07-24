---
title: BC-SALES Relationships
version: 1.0.0
status: active
context: BC-SALES
---

# BC-SALES Relationships

## Internal Relationships

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-SALES-001 | CON-SALES-001 (Customer) | CON-SALES-002 (SalesOrder) | has-many | 1:N | Customer places many sales orders |
| REL-SALES-002 | CON-SALES-001 (Customer) | CON-SALES-004 (Quotation) | has-many | 1:N | Customer receives many quotations |
| REL-SALES-003 | CON-SALES-002 (SalesOrder) | CON-SALES-003 (SalesOrderLineItem) | has-many | 1:N | Order contains many line items |
| REL-SALES-004 | CON-SALES-003 (SalesOrderLineItem) | CON-SALES-002 (SalesOrder) | belongs-to | N:1 | Line item belongs to a sales order |
| REL-SALES-005 | CON-SALES-004 (Quotation) | CON-SALES-005 (QuotationLineItem) | has-many | 1:N | Quotation contains many line items |
| REL-SALES-006 | CON-SALES-005 (QuotationLineItem) | CON-SALES-004 (Quotation) | belongs-to | N:1 | Line item belongs to a quotation |
| REL-SALES-007 | CON-SALES-002 (SalesOrder) | CON-SALES-006 (SalesOrderStatus) | uses | 1:1 | Order has a status value object |
| REL-SALES-008 | CON-SALES-004 (Quotation) | CON-SALES-002 (SalesOrder) | converts-to | 1:0..1 | Accepted quotation may convert to sales order |
| REL-SALES-009 | CON-SALES-007 (DiscountPolicy) | CON-SALES-001 (Customer) | may-apply-to | N:0..1 | Policy may be customer-specific |
| REL-SALES-010 | CON-SALES-015 (QuotationExpiryPolicy) | CON-SALES-004 (Quotation) | governs | 1:N | Policy governs quotation expiry |
| REL-SALES-011 | CON-SALES-016 (CreditCheckPolicy) | CON-SALES-001 (Customer) | evaluates | N:1 | Policy evaluates customer credit |
| REL-SALES-012 | CON-SALES-016 (CreditCheckPolicy) | CON-SALES-002 (SalesOrder) | gates | 1:N | Policy gates order confirmation |

## Event Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-SALES-013 | CON-SALES-008 (CustomerCreated) | CON-SALES-001 (Customer) | caused-by | Event caused by customer creation |
| REL-SALES-014 | CON-SALES-009 (SalesOrderCreated) | CON-SALES-002 (SalesOrder) | caused-by | Event caused by order creation |
| REL-SALES-015 | CON-SALES-010 (QuotationAccepted) | CON-SALES-004 (Quotation) | caused-by | Event caused by quotation acceptance |
| REL-SALES-016 | CON-SALES-010 (QuotationAccepted) | CON-SALES-009 (SalesOrderCreated) | triggers | Acceptance may trigger order creation |

## Command Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-SALES-017 | CON-SALES-011 (CreateCustomer) | CON-SALES-001 (Customer) | creates | Command creates a customer |
| REL-SALES-018 | CON-SALES-011 (CreateCustomer) | CON-SALES-008 (CustomerCreated) | results-in | Success emits this event |
| REL-SALES-019 | CON-SALES-012 (CreateSalesOrder) | CON-SALES-002 (SalesOrder) | creates | Command creates a sales order |
| REL-SALES-020 | CON-SALES-012 (CreateSalesOrder) | CON-SALES-009 (SalesOrderCreated) | results-in | Success emits this event |
| REL-SALES-021 | CON-SALES-013 (CreateQuotation) | CON-SALES-004 (Quotation) | creates | Command creates a quotation |
| REL-SALES-022 | CON-SALES-014 (AcceptQuotation) | CON-SALES-004 (Quotation) | targets | Command targets a quotation |
| REL-SALES-023 | CON-SALES-014 (AcceptQuotation) | CON-SALES-010 (QuotationAccepted) | results-in | Success emits this event |
| REL-SALES-024 | CON-SALES-014 (AcceptQuotation) | CON-SALES-002 (SalesOrder) | may-create | May create order if auto-convert |

## Cross-Context Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-SALES-X01 | CON-SALES-003 (SalesOrderLineItem) | BC-INV (Item) | references | Line item references inventory item |
| REL-SALES-X02 | CON-SALES-005 (QuotationLineItem) | BC-INV (Item) | references | Line item references inventory item |
| REL-SALES-X03 | CON-SALES-002 (SalesOrder) | BC-AR (Invoice) | triggers | Confirmed order triggers invoice creation |
| REL-SALES-X04 | CON-SALES-001 (Customer) | BC-AR (Customer) | syncs | Customer data syncs with AR context |
