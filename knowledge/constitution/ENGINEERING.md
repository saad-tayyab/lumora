# Engineering Constitution

> **Status:** Active  
> **Version:** 1.1.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Principal Software Architect + Staff Software Engineer  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This constitution defines the **permanent engineering rules** for the Lumora ERP system. Every code change, architecture decision, and technical process must comply with these rules.

---

## 2. Technology Mandates

| Technology | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| Runtime | Bun | 1.3.14 | Fast, all-in-one, native TypeScript |
| Monorepo | Turborepo | 2.10.6 | Incremental builds, task orchestration |
| Frontend | Svelte 5 + SvelteKit | 5.56.7 / 2.70.1 | Reactivity without runtime overhead |
| Backend | Encore.ts | 1.57.13 | Type-safe APIs, built-in infra |
| Database | Neon PostgreSQL | 1.1.0 (serverless driver) | Serverless Postgres, branching |
| ORM | Drizzle ORM | 1.0.0-rc.4 | Type-safe, SQL-like, lightweight |
| ORM Validation | drizzle-orm/zod | Built-in | Zod schema generation from Drizzle |
| Auth | Better Auth | 1.6.25 | Flexible, self-hosted |
| UI | Tailwind CSS v4 + Bits UI + shadcn-svelte | 4.3.3 / 2.18.1 / 1.4.2 | Accessible, composable |
| Storage | Cloudflare R2 | @aws-sdk/client-s3 3.1094.0 | S3-compatible, no egress fees |
| Email | Resend | 6.18.0 | Developer-friendly, reliable |
| Payments | Stripe | 22.3.2 | Industry standard, API-first |
| Testing | Vitest + Playwright | 4.1.10 / 1.61.1 | Fast unit tests, real E2E |
| Linting/Formatting | Biome | 2.5.5 | Fast, unified linter + formatter |
| Containers | Docker | Latest | Reproducible environments |
| CI/CD | GitHub Actions | Latest | Native GitHub integration |
| Validation | Zod | 4.4.3 | Type-safe schema validation |

---

## 3. Architecture Principles

### 3.1 Domain-Driven Design

- Every bounded context has its own module.
- Aggregates enforce consistency boundaries.
- Domain events carry cross-context information.
- Repository pattern for data access.

### 3.2 Clean Architecture

- **Domain Layer:** Entities, value objects, domain events, repository interfaces.
- **Application Layer:** Use cases, orchestration, DTOs.
- **Infrastructure Layer:** Database, external services, email, storage.
- **Presentation Layer:** API routes, UI components, layouts.

### 3.3 Feature-First Organization

```
packages/database/src/
  features/
    financial/
      accounts/
      journal-entries/
    inventory/
      items/
      stock-movements/
    auth/
      users/
      roles/
```

Each feature contains: schema, repository, service, types.

### 3.4 SOLID Principles

| Principle | Application |
|-----------|-------------|
| Single Responsibility | One module = one concern |
| Open/Closed | Extend via composition, not modification |
| Liskov Substitution | Interfaces over concrete types |
| Interface Segregation | Small, focused interfaces |
| Dependency Inversion | Depend on abstractions |

---

## 4. Coding Standards

### 4.1 TypeScript

```typescript
// ALWAYS: Explicit return types for exported functions
export function calculateTotal(items: CartItem[]): Money {
  // ...
}

// NEVER: any type
// BAD:  function process(data: any) {}
// GOOD: function process(data: ProcessData) {}

// ALWAYS: Strict null checks
const user = await findUser(id);
if (!user) {
  throw new NotFoundError('User', id);
}
```

### 4.2 File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `InvoiceCard.svelte` |
| Utilities | camelCase | `formatCurrency.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT.ts` |
| Database schemas | snake_case | `journal_entries.ts` |
| Test files | `*.test.ts` / `*.spec.ts` | `accounts.test.ts` |

### 4.3 Import Order

```typescript
// 1. External packages
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// 2. Internal packages
import { db } from '@lumora/database';
import { validate } from '@lumora/validation';

// 3. Local imports
import { formatAmount } from './format';
import type { Account } from './types';
```

### 4.4 Error Handling

```typescript
// Use typed errors, never string throws
class InsufficientStockError extends DomainError {
  constructor(
    public readonly itemId: string,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(`Insufficient stock for ${itemId}: requested ${requested}, available ${available}`);
  }
}
```

---

## 5. Code Organization Rules

1. **No business logic in components or API routes.** Always delegate to services.
2. **No direct database queries outside repository modules.**
3. **No shared mutable state.** Use immutable patterns.
4. **No barrel exports (`index.ts`).** Import directly from modules.
5. **No circular dependencies.** Enforced by Turborepo.
6. **No magic numbers.** Extract to named constants.

---

## 6. Testing Requirements

| Test Type | Tool | Coverage Target | Run Frequency |
|-----------|------|----------------|---------------|
| Unit Tests | Vitest | 80% minimum | Every commit |
| Integration Tests | Vitest | Core flows | Every PR |
| E2E Tests | Playwright | Critical paths | Before merge |
| Type Tests | Vitest (`expectTypeOf`) | All public APIs | Every PR |
| Lint & Format | Biome | 0 errors | Every commit |

---

## 7. Git Workflow

### 7.1 Branch Strategy

```
main          ← production-ready
  └── develop ← integration branch
       ├── feature/xyz
       ├── bugfix/xyz
       └── hotfix/xyz
```

### 7.2 Commit Convention

```
feat(auth): add OAuth2 login support
fix(inventory): correct stock calculation on return
refactor(financial): extract posting service
docs(api): update invoice endpoints
test(ar): add payment reconciliation tests
chore(ci): update Docker build pipeline
```

### 7.3 Pull Request Requirements

- [ ] All tests passing
- [ ] `bunx @biomejs/biome check .` passing
- [ ] Type check passing
- [ ] Code review approved
- [ ] No merge conflicts
- [ ] Documentation updated (if applicable)

---

## 8. Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Total Bundle Size | < 250KB gzipped |
| API Response Time (p95) | < 200ms |
| Database Query (p95) | < 50ms |
| Lighthouse Score | > 90 |

---

## 9. Security Requirements

1. **Input validation on every API endpoint.** Never trust client data.
2. **Parameterized queries only.** Drizzle ORM enforces this.
3. **No secrets in code.** Use environment variables.
4. **HTTPS everywhere.** No exceptions.
5. **CORS restricted** to known origins.
6. **Rate limiting** on all public endpoints.
7. **CSRF protection** on state-changing operations.
8. **Content Security Policy** headers on all responses.

---

## 10. Documentation Requirements

- Every package has `README.md` and `AI.md`.
- Every feature has a usage example.
- Every ADR follows the template in `knowledge/templates/`.
- Every API endpoint has OpenAPI documentation.
- Every database migration has a description.

---

## 11. Non-Negotiables

1. **No deploy without tests passing.**
2. **No merge without code review.**
3. **No secrets in repository.**
4. **No breaking changes without version bump.**
5. **No dead code.** Delete or document why it exists.

---

*This constitution is a living document. Changes require an ADR and team approval.*
