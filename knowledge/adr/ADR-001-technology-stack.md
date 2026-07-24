---
id: ADR-001
title: Technology Stack & Package Versions
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Technology Stack & Package Versions

## Status

Accepted

## Context

Lumora ERP requires a modern, type-safe, performant technology stack for a greenfield AI-first ERP system targeting a 20-year lifespan. The stack must support rapid development, excellent DX, strong typing, and production reliability. All packages must be pinned to their latest stable versions as of July 2026.

## Decision

Adopt the following technology stack with exact version pins:

### Core Runtime & Tooling

| Package | Version | Purpose |
|---------|---------|---------|
| `bun` | `1.3.14` | JavaScript/TypeScript runtime |
| `turbo` | `2.10.6` | Monorepo build orchestration |
| `@biomejs/biome` | `2.5.5` | Linting & formatting |
| `husky` | `9.1.7` | Git hooks |
| `lint-staged` | `17.2.0` | Pre-commit linting |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `svelte` | `5.56.7` | UI framework (runes-based reactivity) |
| `@sveltejs/kit` | `2.70.1` | Application framework |
| `tailwindcss` | `4.3.3` | Utility-first CSS |
| `bits-ui` | `2.18.1` | Headless UI components |
| `shadcn-svelte` | `1.4.2` | Pre-built UI component CLI |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `encore.dev` | `1.57.13` | Type-safe API framework |
| `drizzle-orm` | `1.0.0-rc.4` | Type-safe SQL ORM (beta) |
| `drizzle-kit` | `1.0.0-rc.4` | Migration tooling (beta) |
| `drizzle-zod` | `1.0.0-beta.14` | Schema-to-Zod validation (beta) |

### Database & Auth

| Package | Version | Purpose |
|---------|---------|---------|
| `@neondatabase/serverless` | `1.1.0` | Neon PostgreSQL driver |
| `better-auth` | `1.6.25` | Authentication framework |
| `zod` | `4.4.3` | Schema validation |

### External Services

| Package | Version | Purpose |
|---------|---------|---------|
| `@aws-sdk/client-s3` | `3.1094.0` | Cloudflare R2 (S3-compatible) |
| `resend` | `6.18.0` | Transactional email |
| `stripe` | `22.3.2` | Payment processing |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | `4.1.10` | Unit & integration testing |
| `@playwright/test` | `1.61.1` | End-to-end testing |

## Consequences

### Positive

- All packages at latest stable versions with known-good APIs
- Bun provides fast installs, fast execution, and native TypeScript
- Svelte 5 runes provide fine-grained reactivity without virtual DOM
- Drizzle ORM gives type-safe queries with SQL-like API
- Biome v2 replaces ESLint + Prettier with single fast tool
- Zod v4 provides improved schema composition and type inference

### Negative

- Drizzle ORM 1.0-rc — beta API may change before stable release
- Biome v2 has new config format — migration from v1 required
- Zod v4 has breaking changes from v3 — all Zod usage must follow v4 API
- Vitest v4 — check migration guide for config changes

### Risks

- Drizzle ORM RC packages may introduce breaking changes before 1.0 stable
- Encore.ts is relatively new — smaller community than Express/Fastify
- Svelte 5 ecosystem is still maturing — some libraries may lag behind

## Alternatives Considered

### Next.js + React

**Pros:** Largest ecosystem, extensive library support, strong hiring pool.

**Cons:** Heavier runtime, more complex setup, React Server Components still evolving, larger bundle sizes.

### Hono + React/Vue

**Pros:** Lightweight, fast, edge-compatible.

**Cons:** Less opinionated, requires more boilerplate for ERP-scale apps, no built-in type-safe RPC.

### Drizzle ORM 0.45.x (stable)

**Pros:** Stable, production-tested API.

**Cons:** Missing latest features (RC has improved type inference, better migration tooling). Will eventually need migration to 1.0 anyway.

## Related ADRs

- ADR-002: Monorepo Architecture
- ADR-003: Backend Framework
- ADR-004: Database Architecture
- ADR-006: Frontend Architecture

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition with latest 2026 versions | Architect Agent |
