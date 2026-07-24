---
title: Relationships Index
version: 1.0.0
status: active
---

# Relationships Index

## BC-AUTH Relationships (15)

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-001 | CON-AUTH-001 (User) | CON-AUTH-002 (Role) | has-many | A user can have multiple roles |
| REL-002 | CON-AUTH-001 (User) | CON-AUTH-004 (Session) | has-many | A user can have multiple active sessions |
| REL-003 | CON-AUTH-001 (User) | CON-AUTH-005 (OAuthProvider) | has-many | A user can link multiple OAuth providers |
| REL-004 | CON-AUTH-001 (User) | CON-AUTH-006 (UserCredential) | has-one | A user has exactly one credential record |
| REL-005 | CON-AUTH-001 (User) | CON-AUTH-007 (MFAConfig) | has-one | A user has at most one MFA configuration |
| REL-006 | CON-AUTH-001 (User) | CON-AUTH-008 (AuditLog) | has-many | Every user action produces an audit log entry |
| REL-007 | CON-AUTH-002 (Role) | CON-AUTH-003 (Permission) | has-many | A role contains multiple permissions |
| REL-008 | CON-AUTH-004 (Session) | CON-AUTH-001 (User) | belongs-to | A session belongs to one user |
| REL-009 | CON-AUTH-005 (OAuthProvider) | CON-AUTH-001 (User) | belongs-to | An OAuth provider link belongs to one user |
| REL-010 | CON-AUTH-006 (UserCredential) | CON-AUTH-001 (User) | belongs-to | A credential belongs to one user |
| REL-011 | CON-AUTH-007 (MFAConfig) | CON-AUTH-001 (User) | belongs-to | An MFA config belongs to one user |
| REL-012 | CON-AUTH-008 (AuditLog) | CON-AUTH-001 (User) | belongs-to | An audit log entry belongs to one user |
| REL-013 | CON-AUTH-013 (CreateUser) | CON-AUTH-001 (User) | creates | CreateUser command creates a User aggregate |
| REL-014 | CON-AUTH-014 (AuthenticateUser) | CON-AUTH-001 (User) | authenticates | AuthenticateUser command authenticates a user |
| REL-015 | CON-AUTH-015 (AssignRole) | CON-AUTH-002 (Role) | references | AssignRole command assigns a Role to a User |

## BC-SALES Relationships (24)

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-SALES-001 | CON-SALES-001 (Customer) | CON-SALES-002 (SalesOrder) | has-many | Customer places many sales orders |
| REL-SALES-002 | CON-SALES-001 (Customer) | CON-SALES-004 (Quotation) | has-many | Customer receives many quotations |
| REL-SALES-003 | CON-SALES-002 (SalesOrder) | CON-SALES-003 (SalesOrderLineItem) | has-many | Order contains many line items |
| REL-SALES-004 | CON-SALES-003 (SalesOrderLineItem) | CON-SALES-002 (SalesOrder) | belongs-to | Line item belongs to a sales order |
| REL-SALES-005 | CON-SALES-004 (Quotation) | CON-SALES-005 (QuotationLineItem) | has-many | Quotation contains many line items |
| REL-SALES-006 | CON-SALES-005 (QuotationLineItem) | CON-SALES-004 (Quotation) | belongs-to | Line item belongs to a quotation |
| REL-SALES-007 | CON-SALES-002 (SalesOrder) | CON-SALES-006 (SalesOrderStatus) | uses | Order has a status value object |
| REL-SALES-008 | CON-SALES-004 (Quotation) | CON-SALES-002 (SalesOrder) | converts-to | Accepted quotation may convert to sales order |
| REL-SALES-009 | CON-SALES-007 (DiscountPolicy) | CON-SALES-001 (Customer) | may-apply-to | Policy may be customer-specific |
| REL-SALES-010 | CON-SALES-015 (QuotationExpiryPolicy) | CON-SALES-004 (Quotation) | governs | Policy governs quotation expiry |
| REL-SALES-011 | CON-SALES-016 (CreditCheckPolicy) | CON-SALES-001 (Customer) | evaluates | Policy evaluates customer credit |
| REL-SALES-012 | CON-SALES-016 (CreditCheckPolicy) | CON-SALES-002 (SalesOrder) | gates | Policy gates order confirmation |
| REL-SALES-013 | CON-SALES-008 (CustomerCreated) | CON-SALES-001 (Customer) | caused-by | Event caused by customer creation |
| REL-SALES-014 | CON-SALES-009 (SalesOrderCreated) | CON-SALES-002 (SalesOrder) | caused-by | Event caused by order creation |
| REL-SALES-015 | CON-SALES-010 (QuotationAccepted) | CON-SALES-004 (Quotation) | caused-by | Event caused by quotation acceptance |
| REL-SALES-016 | CON-SALES-010 (QuotationAccepted) | CON-SALES-009 (SalesOrderCreated) | triggers | Acceptance may trigger order creation |
| REL-SALES-017 | CON-SALES-011 (CreateCustomer) | CON-SALES-001 (Customer) | creates | Command creates a customer |
| REL-SALES-018 | CON-SALES-011 (CreateCustomer) | CON-SALES-008 (CustomerCreated) | results-in | Success emits this event |
| REL-SALES-019 | CON-SALES-012 (CreateSalesOrder) | CON-SALES-002 (SalesOrder) | creates | Command creates a sales order |
| REL-SALES-020 | CON-SALES-012 (CreateSalesOrder) | CON-SALES-009 (SalesOrderCreated) | results-in | Success emits this event |
| REL-SALES-021 | CON-SALES-013 (CreateQuotation) | CON-SALES-004 (Quotation) | creates | Command creates a quotation |
| REL-SALES-022 | CON-SALES-014 (AcceptQuotation) | CON-SALES-004 (Quotation) | targets | Command targets a quotation |
| REL-SALES-023 | CON-SALES-014 (AcceptQuotation) | CON-SALES-010 (QuotationAccepted) | results-in | Success emits this event |
| REL-SALES-024 | CON-SALES-014 (AcceptQuotation) | CON-SALES-002 (SalesOrder) | may-create | May create order if auto-convert |
