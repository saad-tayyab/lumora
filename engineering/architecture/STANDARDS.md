# Architecture Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Principal Architect  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines architectural standards for the Lumora ERP system.

---

## 2. Architecture Patterns

### 2.1 Domain-Driven Design

```
Bounded Context
├── Aggregate
│   ├── Entity
│   ├── Value Object
│   └── Domain Event
├── Repository (interface)
├── Service
└── Module
```

### 2.2 Clean Architecture Layers

```
Presentation (API Routes, UI)
    ↓
Application (Use Cases, DTOs)
    ↓
Domain (Entities, Value Objects, Events)
    ↓
Infrastructure (Database, External Services)
```

### 2.3 Feature-First Organization

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
└── index.ts
```

---

## 3. Dependency Rules

1. **Domain depends on nothing** — Pure business logic.
2. **Application depends on Domain** — Uses domain entities.
3. **Infrastructure implements Domain interfaces** — Repository pattern.
4. **Presentation depends on Application** — Calls use cases.

---

## 4. Bounded Context Rules

1. **No shared databases** — Each context owns its data.
2. **No direct imports** — Communication via events.
3. **Clear boundaries** — Explicit context maps.
4. **Ubiquitous language** — Each context has its own glossary.

---

## 5. Decision Records

All architecture decisions must follow ADR format:

```markdown
---
id: ADR-{NUM}
title: {Decision Title}
status: proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
deciders: [list of people]
---

# {Decision Title}

## Status
{Status}

## Context
{What is the issue?

## Decision
{What was decided}

## Consequences
{What are the implications}

## Alternatives Considered
{Other options evaluated}
```

---

## 6. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| God objects | Single responsibility |
| Circular dependencies | Dependency inversion |
| Shared databases | Event-driven communication |
| Leaky abstractions | Clean interfaces |
| Anemic domain model | Rich domain models |
