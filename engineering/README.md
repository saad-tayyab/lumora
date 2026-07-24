# Engineering Documentation

> **Status:** Active  
> **Version:** 1.0.0  
> **Owner:** Principal Software Architect + Staff Software Engineer

---

## Purpose

This directory contains comprehensive engineering standards, best practices, and coding guidelines for every technology in the Lumora ERP stack. Each document serves as the authoritative reference for its domain.

---

## Documentation Structure

| Document | Purpose | Audience |
|----------|---------|----------|
| `frontend/` | Svelte 5, SvelteKit, Tailwind, Bits UI standards | Frontend Engineers |
| `backend/` | Encore.ts, API design, service patterns | Backend Engineers |
| `database/` | Drizzle ORM, PostgreSQL, migrations | Database Engineers |
| `api/` | REST conventions, OpenAPI, versioning | All Engineers |
| `testing/` | Vitest, Playwright, coverage standards | All Engineers |
| `deployment/` | Docker, CI/CD, GitHub Actions | DevOps Engineers |
| `security/` | Auth, encryption, OWASP, compliance | All Engineers |
| `architecture/` | DDD, Clean Architecture, patterns | Architects |
| `performance/` | Optimization, monitoring, budgets | All Engineers |
| `observability/` | Logging, metrics, tracing | All Engineers |

---

## How to Use

1. Read the relevant document before starting work in that domain.
2. Reference the document in code reviews.
3. Update the document when new patterns emerge.
4. Link to these documents from package READMEs and AI.md files.

---

## Relationships

- **Constitution** → Defines rules → **This directory**
- **This directory** → Guides → **Code generation**
- **This directory** → Validated by → **Quality gates**

---

*Each document should be treated as living documentation.*
