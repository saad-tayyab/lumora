# Testing Generation Prompt

> **Prompt ID:** PR-012  
> **Version:** 2.0.0  
> **Agent:** Test Agent  
> **Updated:** 2026-07-25

---

## Purpose

Generate unit, integration, and E2E tests with auth and tenant-aware testing patterns.

---

## Context Variables

| Variable    | Description                      | Example                     |
| ----------- | -------------------------------- | --------------------------- |
| `{CONTEXT}` | Bounded context name (lowercase) | `ar`, `financial`, `inv`    |
| `{CTX}`     | Uppercase bounded context prefix | `AR`, `FIN`, `INV`          |
| `{BC-ID}`   | Bounded context ID               | `BC-AR`, `BC-FIN`, `BC-INV` |

---

## Data Flow

Before generating tests, read these files:

### Step 0: Test Configuration (Prerequisites)

Check: `vitest.config.ts` or `apps/web/vitest.config.ts`
If missing, scaffold:

- Install `vitest`, `@testing-library/svelte`, `@testing-library/jest-dom`
- Create test setup files
- Configure test utilities

Check: `services/backend/src/lib/test-utils.ts`
If missing, create:

- Mock auth session helpers
- Mock tenant context helpers
- API response mocks
- Database mock utilities

### Step 1: Source Code to Test

Read: `services/backend/src/features/{CONTEXT}/*.ts`

- API endpoints (api.ts)
- Service layer (service.ts)
- Repository layer (repo.ts)

### Step 2: Business Rules

Search: `knowledge/rules/active/` for `context: {BC-ID}`

- Map each rule to a specific test case
- Test both valid and invalid scenarios

### Step 3: Database Schema

Read: `packages/database/src/schema/{CONTEXT}/schema.ts`

- Understand data types for test fixtures
- Understand relationships for integration tests

### Step 4: Engineering Standards

Read: `engineering/testing/STANDARDS.md`

- Test file naming conventions
- Test structure patterns
- Mocking strategies

---

## First Implementation Note

If no tests exist for this context yet, this will be the **first reference implementation** for the Lumora ERP testing.

- Run Step 0 first to ensure test utilities exist
- Follow the patterns from `engineering/testing/STANDARDS.md` strictly
- The generated tests will serve as the template for all subsequent contexts
- Include all test layers (unit, integration, E2E) even if some are thin
- Prioritize auth and tenant isolation tests from day one

---

## Prompt

````
# ROLE
You are the QA Engineer for the Lumora ERP system.

# CONTEXT
You are generating tests for existing code with auth and tenant-aware testing patterns.
The tests must follow engineering/testing/STANDARDS.md.

# INSTRUCTIONS

## 0. Prerequisites Check (Run once)
1. Check if `vitest.config.ts` exists
2. If not, scaffold test configuration
3. Check if test utilities exist
4. If not, create mock helpers for auth, tenant, and API
5. Proceed to Step 1 only after all prerequisites exist

## 1. Read Data Sources
1. Read source code in `services/backend/src/features/{CONTEXT}/`
2. Read `knowledge/rules/active/` for business rules with `context: {BC-ID}`
3. Read `packages/database/src/schema/{CONTEXT}/schema.ts` for data model
4. Read `engineering/testing/STANDARDS.md` for patterns

## 2. Generate Test Strategy by Layer

### API Layer Tests (api.integration.test.ts)
a. Test each endpoint:
   - Happy path (200/201)
   - Validation errors (400)
   - Unauthorized (401)
   - Forbidden (403)
   - Not found (404)
   - Conflict (409)
b. Test request validation:
   - Missing required fields
   - Invalid field types
   - Invalid field values
   - Tenant ID injection (should fail if provided in body)

### Service Layer Tests (service.test.ts)
a. Test business logic:
   - Domain rule enforcement
   - State transitions
   - Business invariants
b. Mock dependencies (repo, external services)
c. Test error handling:
   - Map domain errors to APIError
   - Handle not found scenarios
   - Handle conflict scenarios

### Repository Layer Tests (repo.integration.test.ts)
a. Test database operations:
   - Create with tenant isolation
   - Read with tenant filtering
   - Update with tenant verification
   - Soft delete with tenant check
b. Test tenant isolation:
   - Query always includes tenantId
   - Cross-tenant access blocked
   - Tenant ID from session only

## 3. Generate Auth & Tenant Testing Patterns
a. Mock auth session:
   ```typescript
   const mockSession = {
     userId: 'test-user-id',
     tenantId: 'test-tenant-id',
     role: 'admin'
   }
````

b. Test tenant isolation:

- Only return data for current tenant
- Reject cross-tenant access
  c. Test RBAC:
- Allow admin to create
- Reject viewer from creating

## 4. Generate Error Testing Patterns

a. Test APIError classes:

- NotFoundError (404)
- ValidationError (400)
- ConflictError (409)
- ForbiddenError (403)
  b. Test error mapping:
- Service errors → APIError
- Database errors → appropriate error class

## 5. Generate Test Fixtures

a. Create fixture files:

- `fixtures/{context}-fixtures.ts`
- `fixtures/database.ts`
  b. Use factory functions for test data
  c. Include tenant-specific fixtures

## 6. Quality Checks

a. Run `bun run test`
b. Run `bun run test:coverage`
c. Verify coverage meets thresholds

# CONSTRAINTS

- Always test behavior, not implementation
- Always use Arrange-Act-Assert
- Always test error paths
- Always use descriptive names
- Always mock auth sessions
- Always test tenant isolation
- Always test RBAC permissions
- Never test private methods directly
- Never skip auth testing
- Never skip tenant isolation testing
- Never hardcode tenant IDs in tests

# OUTPUT FORMAT

- Unit test files: `*.test.ts`
- Integration test files: `*.integration.test.ts`
- E2E test files: `*.spec.ts`
- Test fixtures: `fixtures/*.ts`
- Coverage report
- Test utilities: `lib/test-utils.ts`

````

---

## Coverage Requirements

| Layer | Minimum Coverage | Critical Paths |
|-------|------------------|----------------|
| Service | 90% | Business logic, error handling |
| Repository | 85% | Tenant isolation, CRUD |
| API | 80% | Auth, validation, error responses |
| Components | 75% | Forms, critical interactions |

### Coverage Checks
1. Run: `bun run test:coverage`
2. Fail if any layer below minimum
3. Report uncovered lines

---

## Test Fixtures

### Fixture Location
- `services/backend/src/features/{CONTEXT}/fixtures/`
- `apps/web/src/lib/test/fixtures/`

### Fixture Patterns
```typescript
// fixtures/invoices.ts
export const createInvoiceFixture = (overrides = {}) => ({
  id: 'invoice-123',
  tenantId: 'tenant-456',
  customerId: 'customer-789',
  amount: 1000,
  status: 'pending',
  dueDate: new Date('2026-08-15'),
  ...overrides
})

export const createMultipleInvoicesFixture = (count = 5) =>
  Array.from({ length: count }, (_, i) =>
    createInvoiceFixture({ id: `invoice-${i}` })
  )
````

### Database Fixtures

```typescript
// fixtures/database.ts
import { seedDatabase, clearDatabase } from "@lumora/database/test-utils";

export const setupTestDatabase = async () => {
  await seedDatabase({
    tenants: [{ id: "tenant-456", name: "Test Tenant" }],
    users: [{ id: "user-123", tenantId: "tenant-456", role: "admin" }],
  });
};

export const teardownTestDatabase = async () => {
  await clearDatabase();
};
```

---

## Usage

```bash
# Trigger via AI agent
"Generate tests for the accounts receivable service"
"Generate tests for the invoice service"
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill             | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `vitest`          | Unit and integration test configuration      |
| `testing-library` | Component testing patterns                   |
| `playwright`      | E2E testing setup                            |
| `turborepo`       | Test task configuration, `--affected` for CI |

---

## Related

- Standards: `engineering/testing/STANDARDS.md`
- Backend Prompt: `PR-011-backend-generation.md`
- Frontend Prompt: `PR-010-frontend-generation.md`
- Agent: `test-agent.md`
