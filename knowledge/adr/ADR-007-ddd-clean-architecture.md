---
id: ADR-007
title: Domain-Driven Design & Clean Architecture
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Domain-Driven Design & Clean Architecture

## Status

Accepted

## Context

Lumora ERP is a complex business system with 11 bounded contexts, 658 business rules, and 784 ontology concepts. The architecture must enforce clear boundaries, prevent coupling between domains, and support independent evolution of each bounded context.

## Decision

Implement Domain-Driven Design (DDD) with Clean Architecture layers, using feature-first organization.

### Clean Architecture Layers

```
Presentation (API Routes, Svelte Components)
    ↓ depends on
Application (Use Cases, DTOs, Orchestration)
    ↓ depends on
Domain (Entities, Value Objects, Domain Events, Repository Interfaces)
    ↑ implemented by
Infrastructure (Database, External Services, Email, Storage)
```

### Bounded Contexts

| ID | Context | Aggregate Root | Description |
|----|---------|---------------|-------------|
| BC-AUTH | Authentication & Identity | User, Role | User identity, roles, permissions |
| BC-FIN | Financial Management | Account, JournalEntry | General ledger, chart of accounts |
| BC-AR | Accounts Receivable | Invoice, Payment | Customer invoices, payments |
| BC-AP | Accounts Payable | Bill, VendorPayment | Vendor bills, payment processing |
| BC-CASH | Cash & Treasury | BankAccount, Transfer | Bank accounts, reconciliation |
| BC-INV | Inventory Management | Item, StockMovement | Stock tracking, warehouses |
| BC-PROC | Procurement | PurchaseOrder, Vendor | Purchase orders, receiving |
| BC-SALES | Sales & Orders | SalesOrder, Customer | Sales orders, quotations |
| BC-HR | Human Resources | Employee, Payroll | Employees, attendance, payroll |
| BC-REPORT | Reporting & Analytics | Report, Dashboard | Financial reports, KPIs |
| BC-AI | AI & Automation | Workflow, Prediction | Workflows, predictions |

### Feature-First File Organization

```
packages/database/src/features/
├── financial/
│   ├── accounts/
│   │   ├── accounts.schema.ts
│   │   ├── accounts.repo.ts
│   │   ├── accounts.service.ts
│   │   └── accounts.types.ts
│   ├── journal-entries/
│   └── index.ts
├── inventory/
│   ├── items/
│   ├── stock-movements/
│   └── index.ts
├── auth/
│   ├── users/
│   ├── roles/
│   └── index.ts
└── index.ts
```

### Bounded Context Rules

1. **No shared databases** — Each context owns its data
2. **No direct imports** — Communication via domain events only
3. **Clear boundaries** — Explicit context maps between domains
4. **Ubiquitous language** — Each context has its own glossary

### Dependency Rules

1. Domain layer depends on nothing — Pure business logic
2. Application layer depends on Domain — Uses domain entities
3. Infrastructure implements Domain interfaces — Repository pattern
4. Presentation depends on Application — Calls use cases

## Consequences

### Positive

- Clear separation of concerns — each bounded context is independent
- Domain logic is testable without infrastructure
- Changes in one context don't affect others
- Repository pattern enables swapping implementations
- Feature-first organization scales with team size

### Negative

- More boilerplate than simple CRUD
- Steeper learning curve for DDD concepts
- Event-driven communication adds complexity
- Requires discipline to maintain boundaries

### Risks

- Over-engineering for simple features
- Eventual consistency challenges with domain events
- Context mapping can become complex

## Alternatives Considered

### Traditional Layered Architecture

**Pros:** Simpler, well-understood.

**Cons:** Tends to become monolithic, hard to enforce boundaries, business logic leaks to presentation.

### Hexagonal Architecture (Ports & Adapters)

**Pros:** Similar benefits to Clean Architecture, well-established pattern.

**Cons:** More abstract naming, similar complexity.

### Module Federation

**Pros:** Independent deployments, runtime composition.

**Cons:** Complex build setup, overkill for monorepo.

## Related ADRs

- ADR-002: Monorepo Architecture
- ADR-004: Database Architecture
- ADR-011: Event-Driven Communication

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
