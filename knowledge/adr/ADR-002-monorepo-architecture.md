---
id: ADR-002
title: Monorepo Architecture with Turborepo
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Monorepo Architecture with Turborepo

## Status

Accepted

## Context

Lumora ERP consists of multiple packages (database, auth, shared, validation, config, UI), a frontend app (SvelteKit), and a backend service (Encore.ts). We need a monorepo strategy that enables code sharing, independent deployments, and fast builds.

## Decision

Use Turborepo v2.10.6 as the monorepo build orchestrator with Bun workspaces.

### Workspace Structure

```
lumora/
├── apps/
│   └── web/                    # SvelteKit frontend
├── services/
│   └── backend/                # Encore.ts API service
├── packages/
│   ├── database/               # Drizzle schemas & migrations
│   ├── auth/                   # Better Auth configuration
│   ├── shared/                 # Common types & utilities
│   ├── validation/             # Zod schemas
│   ├── config/                 # Environment & app config
│   └── ui/                     # Svelte UI components
├── knowledge/                  # Knowledge Repository (SSOT)
├── tooling/                    # Build & dev scripts
├── engineering/                # Engineering standards
└── .ai/                        # AI operating system
```

### Dependency Graph

```
apps/web ──→ packages/ui ──→ packages/shared
    │              │
    │              └──→ packages/validation
    │
    └──→ packages/config

services/backend ──→ packages/database ──→ packages/shared
         │                  │
         │                  └──→ packages/validation
         │
         └──→ packages/auth ──→ packages/shared
```

### Turborepo Pipeline

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "dependsOn": ["^build"], "cache": false, "persistent": true },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "db:generate": { "cache": false },
    "db:migrate": { "cache": false }
  }
}
```

## Consequences

### Positive

- Shared types between frontend and backend
- Incremental builds — only changed packages rebuild
- Cache-first execution — unchanged tasks skip entirely
- Single `bun install` for all dependencies
- Consistent tooling across all packages

### Negative

- Tight coupling between packages — breaking changes cascade
- Larger `node_modules` than needed for single-package projects
- Turborepo adds build orchestration complexity

### Risks

- Over-sharing between packages can create unwanted dependencies
- Need discipline to maintain clean package boundaries

## Alternatives Considered

### Nx

**Pros:** More features, better affected analysis, project graph visualization.

**Cons:** Heavier, more configuration, steeper learning curve.

### Plain npm/Bun Workspaces (no orchestrator)

**Pros:** Simpler, no extra tooling.

**Cons:** No caching, no parallel builds, no task dependency resolution.

### Lerna

**Pros:** Mature, well-known.

**Cons:** Largely superseded by Turborepo/Nx, less actively maintained.

## Related ADRs

- ADR-001: Technology Stack
- ADR-007: Domain-Driven Design & Clean Architecture

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
