# Domain Constitution

> **Status:** Active  
> **Version:** 1.1.0  
> **Last Updated:** 2026-07-25  
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
| BC-ASSET | Fixed Asset Management | Asset register, depreciation schedules, adjustments, disposals | FixedAsset, DepreciationEntry |
| BC-TAX | Tax Management | Tax codes, versioned rates, auto-assignment rules, tax calculations | TaxCode, TaxRate |
| BC-BUDGET | Budget Management | Budget definitions, line-level allocations, consumption tracking | BudgetHeader, BudgetLine |
| BC-AUDIT | Audit & Compliance | Append-only audit log, compliance tracking | AuditLogEntry |
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

### 4.4 Fixed Asset Invariants

- **INV-ASSET-001:** Every fixed asset must have a depreciation method, useful life, and salvage value at acquisition.
- **INV-ASSET-002:** Depreciation entries must reference an open accounting period.
- **INV-ASSET-003:** Accumulated depreciation cannot exceed depreciable cost (acquisition cost minus salvage value).
- **INV-ASSET-004:** Disposed assets must have depreciation updated to disposal date before removal.

### 4.5 Tax Invariants

- **INV-TAX-001:** Every tax rate must have an effective date and optional expiry date for temporal versioning.
- **INV-TAX-002:** Tax transactions must snapshot the rate at time of calculation (not reference current rate).
- **INV-TAX-003:** Tax codes must link to a GL account for liability/asset posting.

### 4.6 Budget Invariants

- **INV-BUDGET-001:** Budget consumption amounts must be non-negative.
- **INV-BUDGET-002:** Only one budget can be active per period per tenant.
- **INV-BUDGET-003:** Budget line amounts must sum to the header total.

### 4.7 Audit Invariants

- **INV-AUDIT-001:** Audit log entries are append-only; no updates or deletes permitted.
- **INV-AUDIT-002:** Every audit log entry must reference an entity type and entity ID.
- **INV-AUDIT-003:** Audit log entries must include old and new values for update operations.

### 4.8 Cross-Context Invariants

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
| BR-009 | BC-ASSET | Depreciation methods must be applied consistently throughout asset life | High |
| BR-010 | BC-ASSET | Land is not a depreciable asset | High |
| BR-011 | BC-ASSET | Depreciation must be posted before period close | High |
| BR-012 | BC-ASSET | Accumulated depreciation cannot exceed depreciable cost | High |
| BR-013 | BC-ASSET | Depreciation method cannot change after asset is placed in service | High |
| BR-014 | BC-TAX | Tax rates are versioned with effective dates | High |
| BR-015 | BC-TAX | Tax amount is calculated and snapshotted at transaction time | High |
| BR-016 | BC-TAX | Tax auto-assignment rules are evaluated by priority order | Medium |
| BR-017 | BC-TAX | Expired tax rates cannot be applied to new transactions | High |
| BR-018 | BC-BUDGET | Budget consumption is tracked per GL account per period | High |
| BR-019 | BC-BUDGET | Budget variance is calculated as consumed minus budgeted amount | Medium |
| BR-020 | BC-BUDGET | Budget consumption reverses when journal entries are voided | High |
| BR-021 | BC-AUDIT | All state-changing operations must create an audit log entry | Critical |
| BR-022 | BC-AUDIT | Audit log entries must not be modifiable or deletable | Critical |
| BR-023 | BC-AUDIT | Audit log entries must include old and new values for updates | High |

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
| Fixed Asset | A long-term tangible asset used in business operations | BC-ASSET |
| Depreciation | Systematic allocation of asset cost over its useful life | BC-ASSET |
| Accumulated Depreciation | Total depreciation recorded against an asset since acquisition | BC-ASSET |
| Tax Code | A configuration defining tax type, rate, and posting rules | BC-TAX |
| Tax Rate Version | A temporal record of a tax rate with effective and expiry dates | BC-TAX |
| Budget Header | A definition of a budget for a specific period | BC-BUDGET |
| Budget Line | An allocation of budget amount to a specific GL account | BC-BUDGET |
| Budget Consumption | Actual spending tracked against a budget line | BC-BUDGET |
| Audit Log | An append-only record of all state changes in the system | BC-AUDIT |
| Batch Payment | A group of payments processed together as a single bank export | BC-AP |

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
| EVT-007 | DepreciationPosted | BC-ASSET | BC-FIN, BC-REPORT | AssetID, PeriodID, Amount |
| EVT-008 | AssetDisposed | BC-ASSET | BC-FIN | AssetID, Proceeds, GainLoss |
| EVT-009 | TaxRateCreated | BC-TAX | BC-FIN | TaxCodeID, Rate, EffectiveDate |
| EVT-010 | BudgetExceeded | BC-BUDGET | BC-REPORT, BC-AI | BudgetLineID, Threshold, Actual |
| EVT-011 | AuditLogCreated | BC-AUDIT | BC-REPORT | EntityType, EntityID, Action |
| EVT-012 | PeriodClosed | BC-FIN | BC-ASSET, BC-BUDGET, BC-REPORT | PeriodID, ClosedBy |

---

## 8. Decision Log

| ID | Date | Decision | Rationale | Status |
|----|------|----------|-----------|--------|
| DOM-001 | 2026-07-24 | Use UUID v7 for all entity IDs | Time-ordered, globally unique, no coordination needed | Accepted |
| DOM-002 | 2026-07-24 | Multi-tenant via row-level security | Cost-effective, simpler ops than schema-per-tenant | Accepted |
| DOM-003 | 2026-07-24 | Domain events for cross-context communication | Decoupled, auditable, supports AI automation | Accepted |
| DOM-004 | 2026-07-25 | Add BC-ASSET, BC-TAX, BC-BUDGET, BC-AUDIT bounded contexts | Comprehensive accounting ERP requires dedicated modules for fixed assets, tax, budgets, and audit | Accepted |

---

## 9. Non-Negotiables

1. **No business logic in the database layer.** All rules enforced in the domain/service layer.
2. **No direct table access across bounded contexts.** Events only.
3. **All monetary calculations use decimal arithmetic.** Never floating point.
4. **Every state change produces an audit event.** No silent mutations.
5. **Constitution changes require explicit approval** and version bump.

---

*This constitution is a living document. Changes must follow the ADR process defined in `knowledge/templates/`.*
