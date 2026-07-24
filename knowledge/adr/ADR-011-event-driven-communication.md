---
id: ADR-011
title: Event-Driven Communication
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Event-Driven Communication

## Status

Accepted

## Context

Bounded contexts in Lumora ERP need to communicate without direct coupling. For example, when an invoice is created in BC-AR, BC-FIN needs to create a journal entry, and BC-REPORT needs to update dashboards. Direct API calls would create tight coupling.

## Decision

Use in-process domain events for cross-context communication within the Encore.ts service.

### Event Catalog

| Event ID | Name | Source | Targets | Payload |
|----------|------|--------|---------|---------|
| EVT-001 | InvoiceCreated | BC-AR | BC-FIN, BC-REPORT | InvoiceID, Amount, CustomerID |
| EVT-002 | PaymentReceived | BC-AR | BC-FIN, BC-CASH | PaymentID, Amount, BankAccountID |
| EVT-003 | BillReceived | BC-AP | BC-FIN | BillID, Amount, VendorID |
| EVT-004 | StockAdjusted | BC-INV | BC-FIN, BC-REPORT | ItemID, Quantity, Reason |
| EVT-005 | EmployeeHired | BC-HR | BC-AUTH | EmployeeID, UserID |
| EVT-006 | JournalEntryPosted | BC-FIN | BC-REPORT | EntryID, Period |

### Event Interface

```typescript
interface DomainEvent {
  id: string;
  type: string;
  timestamp: Date;
  tenantId: string;
  payload: Record<string, unknown>;
  metadata: {
    userId: string;
    correlationId: string;
  };
}
```

### Event Emitter Pattern

```typescript
// In BC-AR service
export async function createInvoice(data: CreateInvoiceInput) {
  const invoice = await repo.create(data);

  // Emit event for other contexts
  await eventBus.emit('InvoiceCreated', {
    invoiceId: invoice.id,
    amount: invoice.total,
    customerId: invoice.customerId,
  });

  return invoice;
}
```

### Event Handler Pattern

```typescript
// In BC-FIN handler
export function onInvoiceCreated(event: DomainEvent) {
  return journalEntryService.create({
    reference: event.payload.invoiceId,
    lines: [
      { accountId: accountsReceivable, debit: event.payload.amount },
      { accountId: revenue, credit: event.payload.amount },
    ],
  });
}
```

### Event Store

```typescript
// Store events for audit and replay
const domainEvents = pgTable('domain_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 100 }).notNull(),
  tenantId: uuid('tenant_id').notNull(),
  payload: jsonb('payload').notNull(),
  metadata: jsonb('metadata').notNull(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

## Consequences

### Positive

- Bounded contexts remain decoupled
- Events are auditable and can be replayed
- New consumers can be added without modifying producers
- Async processing improves response times

### Negative

- Eventual consistency — data may be temporarily inconsistent
- Event ordering challenges
- Debugging is harder than synchronous calls
- Event schema evolution requires care

### Risks

- Event storms can overwhelm consumers
- Missing event handlers cause silent failures
- Event schema changes can break consumers

## Alternatives Considered

### Direct API Calls

**Pros:** Simple, synchronous, easy to debug.

**Cons:** Tight coupling, cascading failures, hard to add new consumers.

### Message Queue (RabbitMQ/Redis)

**Pros:** Reliable delivery, retry mechanisms, queueing.

**Cons:** Additional infrastructure, operational complexity, overkill for in-process events.

### CDC (Change Data Capture)

**Pros:** No application code changes, captures all changes.

**Cons:** Latency, complex setup, less control over event content.

## Related ADRs

- ADR-004: Database Architecture
- ADR-007: Domain-Driven Design
- ADR-010: Multi-Tenancy

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
