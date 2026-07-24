# Domain Constitution

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Product Ontologist + ERP Architect  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This constitution defines the **permanent domain rules** for the Lumora ERP system. It is the authoritative source for all business domain decisions. No business rule may exist outside this knowledge repository.

---

## 2. Domain Vision

Lumora is an AI-first ERP system designed for small-to-medium enterprises. It replaces fragmented business tools with a unified, intelligent platform that automates accounting, inventory, HR, and operations.

---

## 3. Core Bounded Contexts

| ID | Bounded Context | Description | Aggregate Root |
|----|-----------------|-------------|----------------|
| BC-AUTH | Authentication & Identity | User identity, roles, permissions, sessions | User, Role |
| BC-FIN | Financial Management | General ledger, chart of accounts, journal entries | Account, JournalEntry |
| BC-AR | Accounts Receivable | Customer invoices, payments, credit management | Invoice, Payment |
| BC-AP | Accounts Payable | Vendor bills, payment processing, approvals | Bill, VendorPayment |
| BC-CASH | Cash & Treasury | Bank accounts, transfers, reconciliation | BankAccount, Transfer |
| BC-INV | Inventory Management | Stock tracking, warehouses, movements | Item, StockMovement |
| BC-PROC | Procurement | Purchase orders, receiving, vendor management | PurchaseOrder, Vendor |
| BC-SALES | Sales & Orders | Sales orders, quotations, customer management | SalesOrder, Customer |
| BC-HR | Human Resources | Employees, attendance, leave, payroll | Employee, Payroll |
| BC-REPORT | Reporting & Analytics | Financial reports, dashboards, KPIs | Report, Dashboard |
| BC-AI | AI & Automation | Workflows, predictions, anomaly detection | Workflow, Prediction |

---

## 4. Domain Invariants

### 4.1 Financial Invariants

- **INV-FIN-001:** Every journal entry must balance (total debits = total credits).
- **INV-FIN-002:** Closed accounting periods cannot be modified.
- **INV-FIN-003:** Every financial transaction must have an audit trail.
- **INV-FIN-004:** Currency amounts must be stored with decimal precision (numeric, not float).
- **INV-FIN-005:** Chart of accounts follows a hierarchical structure with strict typing (Asset, Liability, Equity, Revenue, Expense).

### 4.2 Inventory Invariants

- **INV-INV-001:** Stock quantity cannot go negative unless explicitly allowed by configuration.
- **INV-INV-002:** Every stock movement must reference a source document.
- **INV-INV-003:** Items must belong to exactly one item category.

### 4.3 Authentication Invariants

- **INV-AUTH-001:** Every action must be attributable to a user or system process.
- **INV-AUTH-002:** Roles are additive only; no role can revoke base permissions.
- **INV-AUTH-003:** Soft deletion is mandatory for all user-facing entities.

### 4.4 Cross-Context Invariants

- **INV-CROSS-001:** No bounded context may directly access another context's database tables.
- **INV-CROSS-002:** Cross-context communication happens through domain events only.
- **INV-CROSS-003:** Every entity must have a globally unique identifier (UUID v7).

---

## 5. Business Rules Registry

| Rule ID | Context | Rule | Priority |
|---------|---------|------|----------|
| BR-001 | BC-FIN | All monetary values use minor units for storage | High |
| BR-002 | BC-FIN | Fiscal year configuration is tenant-specific | High |
| BR-003 | BC-AR | Payment terms are defined per customer | Medium |
| BR-004 | BC-AP | Three-way matching required for PO-based bills | High |
| BR-005 | BC-INV | Reorder points trigger automated purchase suggestions | Medium |
| BR-006 | BC-HR | Leave requests require manager approval | Medium |
| BR-007 | BC-SALES | Quotations expire after configurable days | Low |
| BR-008 | BC-CASH | Bank reconciliation requires matching with tolerance | High |

---

## 6. Ubiquitous Language Glossary (Domain Terms)

| Term | Definition | Bounded Context |
|------|-----------|-----------------|
| Journal Entry | A recording of a financial transaction in the general ledger | BC-FIN |
| Chart of Accounts | The structured list of all financial accounts | BC-FIN |
| Accounts Receivable | Money owed to the business by customers | BC-AR |
| Accounts Payable | Money the business owes to vendors | BC-AP |
| General Ledger | The master record of all financial transactions | BC-FIN |
| Stock Keeping Unit (SKU) | A unique identifier for each distinct product | BC-INV |
| Purchase Order | A formal document requesting goods from a vendor | BC-PROC |
| Sales Order | A customer's commitment to purchase goods/services | BC-SALES |
| Payroll | The process of paying employees | BC-HR |
| Three-Way Matching | Matching PO, receiving document, and vendor bill | BC-AP |

---

## 7. Event Catalog

| Event ID | Name | Source Context | Target Contexts | Payload |
|----------|------|----------------|-----------------|---------|
| EVT-001 | InvoiceCreated | BC-AR | BC-FIN, BC-REPORT | InvoiceID, Amount, CustomerID |
| EVT-002 | PaymentReceived | BC-AR | BC-FIN, BC-CASH | PaymentID, Amount, BankAccountID |
| EVT-003 | BillReceived | BC-AP | BC-FIN | BillID, Amount, VendorID |
| EVT-004 | StockAdjusted | BC-INV | BC-FIN, BC-REPORT | ItemID, Quantity, Reason |
| EVT-005 | EmployeeHired | BC-HR | BC-AUTH | EmployeeID, UserID |
| EVT-006 | JournalEntryPosted | BC-FIN | BC-REPORT | EntryID, Period |

---

## 8. Decision Log

| ID | Date | Decision | Rationale | Status |
|----|------|----------|-----------|--------|
| DOM-001 | 2026-07-24 | Use UUID v7 for all entity IDs | Time-ordered, globally unique, no coordination needed | Accepted |
| DOM-002 | 2026-07-24 | Multi-tenant via row-level security | Cost-effective, simpler ops than schema-per-tenant | Accepted |
| DOM-003 | 2026-07-24 | Domain events for cross-context communication | Decoupled, auditable, supports AI automation | Accepted |

---

## 9. Non-Negotiables

1. **No business logic in the database layer.** All rules enforced in the domain/service layer.
2. **No direct table access across bounded contexts.** Events only.
3. **All monetary calculations use decimal arithmetic.** Never floating point.
4. **Every state change produces an audit event.** No silent mutations.
5. **Constitution changes require explicit approval** and version bump.

---

*This constitution is a living document. Changes must follow the ADR process defined in `knowledge/templates/`.*
