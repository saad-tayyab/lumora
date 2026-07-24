---
title: BC-AR Relationships
context: BC-AR
version: 1.0.0
status: active
---

# BC-AR (Accounts Receivable) Relationships

## Relationship Map

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-001 | CON-AR-001 (Customer) | CON-AR-002 (Invoice) | has-many | 1:N | A customer has many invoices |
| REL-002 | CON-AR-002 (Invoice) | CON-AR-003 (InvoiceLineItem) | has-many | 1:N | An invoice has many line items |
| REL-003 | CON-AR-002 (Invoice) | CON-AR-005 (PaymentApplication) | has-many | 1:N | An invoice has many payment applications |
| REL-004 | CON-AR-004 (Payment) | CON-AR-005 (PaymentApplication) | has-many | 1:N | A payment has many payment applications |
| REL-005 | CON-AR-001 (Customer) | CON-AR-008 (CreditLimit) | has-one | 1:1 | A customer has one credit limit |
| REL-006 | CON-AR-001 (Customer) | CON-AR-006 (CreditNote) | has-many | 1:N | A customer has many credit notes |
| REL-007 | CON-AR-002 (Invoice) | CON-AR-009 (InvoiceCreated) | triggers | 1:1 | Invoice creation triggers event |
| REL-008 | CON-AR-004 (Payment) | CON-AR-010 (PaymentReceived) | triggers | 1:1 | Payment recording triggers event |
| REL-009 | CON-AR-006 (CreditNote) | CON-AR-011 (CreditNoteIssued) | triggers | 1:1 | Credit note issuance triggers event |
| REL-010 | CON-AR-013 (CreateInvoice) | CON-AR-002 (Invoice) | targets | 1:1 | Command targets invoice creation |
| REL-011 | CON-AR-014 (RecordPayment) | CON-AR-004 (Payment) | targets | 1:1 | Command targets payment recording |
| REL-012 | CON-AR-015 (IssueCreditNote) | CON-AR-006 (CreditNote) | targets | 1:1 | Command targets credit note issuance |
| REL-013 | CON-AR-016 (CreditApprovalPolicy) | CON-AR-008 (CreditLimit) | enforces | N:1 | Policy enforces credit limit |
| REL-014 | CON-017 (DunningPolicy) | CON-AR-007 (AgingBucket) | uses | N:N | Policy uses aging buckets |
| REL-015 | CON-AR-012 (InvoiceOverdue) | CON-AR-017 (DunningPolicy) | triggers | 1:N | Overdue event triggers dunning |

## Cross-Context Relationships

| Source Context | Target Context | Event | Description |
|---------------|---------------|-------|-------------|
| BC-AR | BC-FIN | InvoiceCreated (EVT-001) | Triggers journal entry creation |
| BC-AR | BC-REPORT | InvoiceCreated (EVT-001) | Triggers report refresh |
| BC-AR | BC-FIN | PaymentReceived (EVT-002) | Triggers revenue recognition |
| BC-AR | BC-CASH | PaymentReceived (EVT-002) | Triggers bank reconciliation |
| BC-AR | BC-FIN | CreditNoteIssued | Triggers revenue reversal |

## Aggregate Boundaries

```
┌─────────────────────────────────────────────────────┐
│                    BC-AR                             │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Invoice (Aggregate Root)                     │   │
│  │  ├── InvoiceLineItem (Entity)                │   │
│  │  └── PaymentApplication (Entity)             │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Payment (Aggregate Root)                     │   │
│  │  └── PaymentApplication (Entity)             │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Customer (Entity) ──── CreditLimit (Value Object)  │
│  CreditNote (Entity)                                 │
│  AgingBucket (Value Object)                          │
│                                                      │
│  Events: InvoiceCreated, PaymentReceived,            │
│          CreditNoteIssued, InvoiceOverdue            │
│  Commands: CreateInvoice, RecordPayment,             │
│            IssueCreditNote                           │
│  Policies: CreditApprovalPolicy, DunningPolicy       │
└─────────────────────────────────────────────────────┘
```

## References

- [Domain Constitution](../../constitution/DOMAIN.md#3-core-bounded-contexts)
- [Event Catalog](../../constitution/DOMAIN.md#7-event-catalog)
- [Business Rules](../../constitution/DOMAIN.md#5-business-rules-registry)
