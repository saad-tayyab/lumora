---
id: ADR-INDEX
title: Architecture Decision Records Index
version: 1.0.0
date: 2026-07-24
---

# Architecture Decision Records

## Active ADRs

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-001 | Technology Stack & Package Versions | accepted | 2026-07-24 |
| ADR-002 | Monorepo Architecture with Turborepo | accepted | 2026-07-24 |
| ADR-003 | Backend Framework - Encore.ts | accepted | 2026-07-24 |
| ADR-004 | Database Architecture - Neon PostgreSQL + Drizzle ORM | accepted | 2026-07-24 |
| ADR-005 | Authentication - Better Auth | accepted | 2026-07-24 |
| ADR-006 | Frontend Architecture - Svelte 5 + SvelteKit | accepted | 2026-07-24 |
| ADR-007 | Domain-Driven Design & Clean Architecture | accepted | 2026-07-24 |
| ADR-008 | Testing Strategy | accepted | 2026-07-24 |
| ADR-009 | API Design & Error Handling | accepted | 2026-07-24 |
| ADR-010 | Multi-Tenancy & Row-Level Security | accepted | 2026-07-24 |
| ADR-011 | Event-Driven Communication | accepted | 2026-07-24 |
| ADR-012 | File Storage - Cloudflare R2 | accepted | 2026-07-24 |
| ADR-013 | Email Service - Resend | accepted | 2026-07-24 |
| ADR-014 | Payment Integration - Stripe | accepted | 2026-07-24 |

## ADR Dependencies

```
ADR-001 (Technology Stack)
├── ADR-002 (Monorepo)
├── ADR-003 (Backend Framework)
├── ADR-004 (Database)
├── ADR-005 (Authentication)
├── ADR-006 (Frontend)
├── ADR-008 (Testing)
├── ADR-012 (File Storage)
├── ADR-013 (Email)
└── ADR-014 (Payments)

ADR-007 (DDD & Clean Architecture)
├── ADR-004 (Database)
├── ADR-010 (Multi-Tenancy)
└── ADR-011 (Event-Driven)

ADR-009 (API Design)
├── ADR-003 (Backend Framework)
└── ADR-005 (Authentication)
```

## Diagrams

| ID | Title | File |
|----|-------|------|
| DIAG-001 | System Architecture Overview | `knowledge/graph/architecture-overview.md` |
