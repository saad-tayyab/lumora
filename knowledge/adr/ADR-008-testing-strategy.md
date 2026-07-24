---
id: ADR-008
title: Testing Strategy
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer, QA Engineer]
---

# Testing Strategy

## Status

Accepted

## Context

Lumora ERP is a financial system where correctness is critical. Testing must cover unit logic, integration between components, and end-to-end user workflows. The testing strategy must be fast, reliable, and provide high confidence.

## Decision

Use Vitest v4.1.10 for unit/integration tests and Playwright v1.61.1 for E2E tests.

### Test Pyramid

```
        ╱╲
       ╱  ╲         E2E Tests (Playwright)
      ╱ 5% ╲        Critical user flows
     ╱──────╲
    ╱        ╲       Integration Tests (Vitest)
   ╱   25%    ╲     API endpoints, DB queries, service interactions
  ╱────────────╲
 ╱              ╲    Unit Tests (Vitest)
╱     70%        ╲  Business logic, utilities, pure functions
╱──────────────────╲
```

### Coverage Targets

| Test Type | Coverage Target | Run Frequency |
|-----------|----------------|---------------|
| Unit Tests | 80% minimum | Every commit |
| Integration Tests | Core flows | Every PR |
| E2E Tests | Critical paths | Before merge |
| Type Tests | All public APIs | Every PR |

### Test Organization

```
packages/database/src/features/financial/accounts/
├── accounts.schema.ts
├── accounts.repo.ts
├── accounts.service.ts
├── accounts.types.ts
└── accounts.test.ts        # Co-located tests
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

### Test Patterns

```typescript
// Unit test pattern
describe('AccountService', () => {
  it('should create account with valid data', async () => {
    const result = await service.createAccount({
      code: '1000',
      name: 'Cash',
      type: 'asset',
    });
    expect(result.id).toBeDefined();
    expect(result.code).toBe('1000');
  });

  it('should reject duplicate account codes', async () => {
    await service.createAccount({ code: '1000', name: 'Cash', type: 'asset' });
    await expect(
      service.createAccount({ code: '1000', name: 'Cash 2', type: 'asset' })
    ).rejects.toThrow('DuplicateAccountCode');
  });
});
```

### Playwright E2E Pattern

```typescript
// e2e/invoice.spec.ts
import { test, expect } from '@playwright/test';

test('should create and submit invoice', async ({ page }) => {
  await page.goto('/financial/invoices');
  await page.click('[data-testid="create-invoice"]');
  await page.fill('[data-testid="customer"]', 'Acme Corp');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

## Consequences

### Positive

- Vitest is fast — native ESM, watch mode, TypeScript support
- Co-located tests — tests live next to source code
- 80% coverage threshold ensures baseline quality
- Playwright provides reliable cross-browser E2E testing
- Type tests catch API contract violations at compile time

### Negative

- 80% coverage target requires significant test writing effort
- E2E tests are slower and more brittle than unit tests
- Financial accuracy requires extensive edge case testing

### Risks

- Flaky E2E tests can slow CI pipeline
- Mocking external services (Stripe, Resend) adds test maintenance burden

## Alternatives Considered

### Jest

**Pros:** Most popular, large ecosystem.

**Cons:** Slower than Vitest, no native ESM support, less TypeScript-friendly.

### Cypress

**Pros:** Great debugging, visual testing.

**Cons:** Slower than Playwright, limited browser support, paid features.

### Vitest + Testing Library

**Pros:** Testing Library encourages accessible tests.

**Cons:** Overkill for non-DOM testing, adds dependency.

## Related ADRs

- ADR-001: Technology Stack
- ADR-003: Backend Framework
- ADR-006: Frontend Architecture

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
