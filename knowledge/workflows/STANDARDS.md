# Workflow Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Knowledge Engineer  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines how business processes and workflows are captured in the Lumora ERP knowledge repository. Every workflow must comply with these standards.

---

## 2. Workflow ID Format

```
WF-{CONTEXT}-{NUMBER}
```

| Part | Rule | Example |
|------|------|---------|
| `WF` | Fixed prefix | `WF` |
| `{CONTEXT}` | Bounded context code | `FIN`, `AR`, `INV` |
| `{NUMBER}` | Zero-padded 3-digit sequence | `001`, `042` |

---

## 3. Workflow File Format

```yaml
---
id: WF-AR-001
name: Invoice Creation Workflow
context: BC-AR
type: process
status: active
version: 1.0.0
owners:
  - CPA
  - Knowledge Engineer
trigger:
  type: command
  name: CreateInvoice
actors:
  - AccountsReceivable
  - System
related_rules:
  - BR-004
  - BR-005
concepts:
  - CON-AR-001
  - CON-AR-002
---
```

---

## 4. Workflow Types

| Type | Description | Example |
|------|-------------|---------|
| `process` | Multi-step business process | Invoice creation |
| `automation` | System-triggered action | Stock reorder |
| `approval` | Human approval gate | Leave request approval |
| `integration` | External system sync | Bank feed import |
| `validation` | Pre-submission checks | Invoice validation |

---

## 5. Workflow Structure

```markdown
---
id: WF-AR-001
name: Invoice Creation Workflow
context: BC-AR
type: process
version: 1.0.0
---

# Invoice Creation Workflow

## Overview
Process for creating a customer invoice from a sales order.

## Trigger
- **Type:** Manual (command)
- **Actor:** Accounts Receivable Clerk
- **Input:** SalesOrderID

## Participants
| Role | Responsibility |
|------|---------------|
| AccountsReceivable | Initiates invoice |
| System | Validates and posts |
| Approver | Approves if over threshold |

## Steps

### Step 1: Validate Sales Order
- **Action:** System validates sales order is complete
- **Input:** SalesOrderID
- **Output:** Validated SalesOrder
- **Rules:** BR-004
- **On Failure:** Return error to user

### Step 2: Calculate Totals
- **Action:** System calculates line totals, tax, and grand total
- **Input:** Validated SalesOrder
- **Output:** InvoiceTotals
- **Rules:** BR-005

### Step 3: Create Invoice
- **Action:** System creates invoice record
- **Input:** InvoiceTotals
- **Output:** InvoiceID
- **Events Emitted:** InvoiceCreated

### Step 4: Post to Ledger
- **Action:** System creates journal entries
- **Input:** InvoiceID
- **Output:** JournalEntryID
- **Rules:** BR-001

### Step 5: Send Notification
- **Action:** System sends invoice to customer
- **Input:** InvoiceID
- **Output:** EmailSent

## Exception Handling
| Exception | Handler |
|-----------|---------|
| Sales order not found | Return error, log event |
| Validation fails | Return error to user |
| Ledger posting fails | Rollback invoice, return error |

## Data Flow
```mermaid
graph LR
    A[Sales Order] --> B[Validate]
    B --> C[Calculate]
    C --> D[Create Invoice]
    D --> E[Post to Ledger]
    E --> F[Send Notification]
```

## Related Workflows
- WF-AR-002: Payment Receipt Workflow
- WF-FIN-001: Journal Entry Posting Workflow

## Change History
| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Knowledge Engineer |
```

---

## 6. Step Definition

Each workflow step must define:

| Field | Required | Description |
|-------|----------|-------------|
| Action | yes | What happens |
| Input | yes | What data is needed |
| Output | yes | What data is produced |
| Rules | no | Business rules that apply |
| On Failure | yes | What happens if step fails |

---

## 7. Workflow Organization

```
knowledge/workflows/
├── STANDARDS.md                    # This file
├── INDEX.md                        # Master index of all workflows
├── active/
│   ├── WF-AR-001.invoice-creation.md
│   ├── WF-AR-002.payment-receipt.md
│   ├── WF-FIN-001.journal-posting.md
│   └── ...
├── deprecated/
│   └── ...
└── diagrams/
    ├── invoice-lifecycle.mermaid
    └── order-to-cash.mermaid
```

---

## 8. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Workflow files | `WF-{CTX}-{NUM}.{kebab-name}.md` | `WF-AR-001.invoice-creation.md` |
| Workflow names | Descriptive with "Workflow" suffix | "Invoice Creation Workflow" |
| Diagram files | `{purpose}.mermaid` | `invoice-lifecycle.mermaid` |

---

## 9. Validation Checklist

- [ ] Workflow ID follows `WF-{CTX}-{NUM}` format
- [ ] File name matches workflow name
- [ ] YAML front matter contains all required fields
- [ ] All steps have Action, Input, Output, On Failure
- [ ] All referenced rule IDs exist
- [ ] All referenced concept IDs exist
- [ ] Mermaid diagram is valid
- [ ] Exception handling is complete
- [ ] Related workflows are cross-referenced
- [ ] Version bumped for any change
