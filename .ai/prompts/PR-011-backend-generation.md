# Backend Generation Prompt

> **Prompt ID:** PR-011  
> **Version:** 4.0.0  
> **Agent:** Code Agent  
> **Updated:** 2026-07-25

---

## Purpose

Generate Encore.ts backend services including API endpoints, service layer, and repository layer from specifications. Merged from PR-009 (API Generation) and PR-011 (Backend Generation).

---

## Context Variables

| Variable | Meaning | Mapping |
|----------|---------|---------|
| `{CONTEXT}` | Directory-level context name (lowercase) | `ar`, `financial`, `inv`, `ap`, `cash`, `auth`, `hr`, `proc`, `sales`, `report`, `ai`, `asset`, `tax`, `budget`, `audit` |
| `{CTX}` | Uppercase bounded context prefix | `AR`, `FIN`, `INV`, `AP`, `CASH`, `AUTH`, `HR`, `PROC`, `SALES`, `REPORT`, `AI`, `ASSET`, `TAX`, `BUDGET`, `AUDIT` |
| `{BC-ID}` | Bounded context ID from DOMAIN.md | `BC-AR`, `BC-FIN`, `BC-INV`, `BC-AP`, `BC-CASH`, `BC-AUTH`, `BC-HR`, `BC-PROC`, `BC-SALES`, `BC-REPORT`, `BC-AI`, `BC-ASSET`, `BC-TAX`, `BC-BUDGET`, `BC-AUDIT` |

Example: For Accounts Receivable → `{CONTEXT}` = `ar`, `{CTX}` = `AR`, `{BC-ID}` = `BC-AR`.

---

## Data Flow

Before generating code, the agent must read these files in order:

### Step 0: Auth & Shared Packages (Prerequisites)

If no backend code exists yet, these foundational packages must be scaffolded first.

Check: `packages/auth/src/index.ts`
If missing, scaffold `packages/auth/`:
- Install `better-auth` and `@better-auth/drizzle`
- Create `src/index.ts` — Better Auth server config with email/password provider, session management, organization plugin (multi-tenant)
- Create `src/client.ts` — Auth client helper for frontend
- Create `src/middleware.ts` — Session extraction helper for Encore.ts
- Create `src/rbac.ts` — Role-based access control utility (`requireRole(ctx, role)`)
- Create `src/permissions.ts` — Permission definitions per resource/action
- Follow `better-auth-best-practices` and `better-auth-security-best-practices` skills

Check: `packages/shared/src/index.ts`
If missing, scaffold `packages/shared/`:
- Create `src/types.ts` — Shared types: `TenantId`, `UserId`, `Pagination`, `SortOrder`, `ApiResponse<T>`
- Create `src/utils.ts` — Utility functions: `formatCurrency()`, `formatDate()`, `generateId()`
- Create `src/constants.ts` — Constants: `DEFAULT_TENANT_ID`, `PAGE_SIZE`, `MAX_PAGE_SIZE`

Check: `packages/config/src/index.ts`
If missing, scaffold `packages/config/`:
- Create `src/env.ts` — Zod-validated environment variables (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
- Create `src/index.ts` — Re-exports

Check: `packages/validation/src/index.ts`
If missing, scaffold `packages/validation/`:
- Create `src/index.ts` — Re-export Zod schemas from `@lumora/database/schema`
- Create `src/helpers.ts` — Shared validation helpers: `dateRange()`, `positiveAmount()`, `nonEmptyArray()`

After scaffolding, proceed to Step 1.

### Step 1: Database Schema (Source of Truth for data model)

Read: `packages/database/src/schema/{CONTEXT}/schema.ts`

- This defines all tables, columns, types, and relationships
- Use this as the authoritative data model
- Every entity, column, and type you generate must match this schema exactly

### Step 2: Ontology Concepts (Business definitions)

Read all files matching: `knowledge/ontology/contexts/{BC-ID}/CON-{CTX}-*.md`

- Focus on entity and aggregate concepts (type: entity or aggregate)
- These define business objects, attributes, and domain language
- Use the ubiquitous language from these files in your service layer

### Step 3: Business Rules (Validation logic)

Search: `knowledge/rules/active/` for rules with `context: {BC-ID}`

- These define validation, invariants, and constraints to enforce in service layer
- Map each rule to a specific validation or business logic check

### Step 4: Engineering Standards (Patterns to follow)

Read these files:

- `engineering/backend/STANDARDS.md` — Three-layer architecture, file structure, error patterns
- `engineering/api/STANDARDS.md` — Endpoint conventions, request/response design, naming

Follow these patterns strictly:

- Three-layer architecture: API → Service → Repository
- Error handling: typed `APIError` classes (defined in `errors.ts`)
- Endpoint naming conventions from `engineering/api/STANDARDS.md`

### Step 5: Existing Code (Reference patterns)

Check: `services/backend/src/features/{CONTEXT}/`

- If the directory exists: follow the same file structure, naming, and import patterns
- If the directory does not exist: create the directory structure from scratch
- Always reference sibling feature directories for consistency

---

## First Implementation Note

If no backend code exists for this context yet, this will be the **first reference implementation** for the Lumora ERP backend.

- Run Step 0 first to ensure auth and shared packages exist
- Follow the patterns from `engineering/backend/STANDARDS.md` strictly
- The generated code will serve as the template for all subsequent contexts
- Prioritize clarity and completeness over speed — future code will mirror this structure
- Include all layers (API, service, repository, types, errors) even if some are thin
- Every endpoint must have auth and tenant isolation from day one

---

## Prompt

```
# ROLE
You are the Staff Software Engineer for the Lumora ERP system.

# CONTEXT
You are generating a complete backend service for a bounded context.
The code must follow engineering/backend/STANDARDS.md and engineering/api/STANDARDS.md.

# INSTRUCTIONS

## 0. Prerequisites Check (Run once)
1. Check if `packages/auth/src/index.ts` exists
2. If not, scaffold auth package using `create-auth` skill:
   a. Install `better-auth` and `@better-auth/drizzle`
   b. Create server config, session helper, RBAC utility
   c. Load `better-auth-best-practices` and `better-auth-security-best-practices` skills
3. Check if `packages/shared/src/index.ts` exists
4. If not, create shared types (TenantId, UserId, Pagination), utils, constants
5. Check if `packages/config/src/index.ts` exists
6. If not, create Zod-validated env config
7. Check if `packages/validation/src/index.ts` exists
8. If not, create shared Zod schema re-exports and helpers
9. Proceed to Step 1 only after all prerequisites exist

## 1. Read Data Sources
1. Read `packages/database/src/schema/{CONTEXT}/schema.ts` to get the table definitions
2. Read all files matching `knowledge/ontology/contexts/{BC-ID}/CON-{CTX}-*.md` for business concepts
3. Search `knowledge/rules/active/` for rules with `context: {BC-ID}` for validation logic
4. Read `engineering/backend/STANDARDS.md` and `engineering/api/STANDARDS.md` for patterns
5. Check `services/backend/src/features/{CONTEXT}/` for existing code to match

## 2. API Endpoint Design
1. Design CRUD endpoints for each entity in the schema:
   a. GET /resources (list with pagination, filtered by tenantId)
   b. GET /resources/:id (get by ID, filtered by tenantId)
   c. POST /resources (create, tenantId from session)
   d. PUT /resources/:id (update, filtered by tenantId)
   e. DELETE /resources/:id (soft delete, filtered by tenantId)
2. For each endpoint:
   a. Define request schema with Zod (use drizzle-orm/zod to derive from schema)
   b. Define response schema
   c. Define error responses (use structured error codes from `errors.ts`)
   d. Add authentication: extract session, get userId and tenantId
   e. Add authorization: check RBAC roles via `requireRole(ctx, 'role_name')`
   f. Add input validation (enforce business rules from Step 3)
   g. Ensure tenantId is NEVER accepted from request body — always from session

## 3. Generate Service Files
Generate all files in `services/backend/src/features/{CONTEXT}/`:

1. `api.ts` — API definitions using Encore.ts `api()`. Input validation, HTTP concerns, Encore.ts Handler types. Import from `./service`, `./types`, `./errors`.

2. `service.ts` — Business logic and orchestration. Domain rule enforcement. Import from `./repo`, `./types`, `./errors`. Call repository for data access.

3. `repo.ts` — Data access layer with Drizzle ORM. Import `db` from `@lumora/database`. Use parameterized queries only. Use transactions where needed. Import table definitions from `packages/database/src/schema/{CONTEXT}/schema.ts`.

4. `types.ts` — TypeScript types and Zod schemas. Derive from Drizzle schema using `drizzle-orm/zod`. Export request/response types.

5. `errors.ts` — Typed domain errors extending `APIError`. One error class per domain error. Include error code and HTTP status.

## 4. Authentication & Authorization

1. Authentication:
   a. Import `getSession` from `@lumora/auth/middleware`
   b. Extract session from request at the start of every endpoint handler
   c. Attach `userId` and `tenantId` to the request context
   d. Return `APIError('Unauthorized', 'Valid session required', 401)` if no valid session

2. Authorization (RBAC):
   a. Import `requireRole` from `@lumora/auth/rbac`
   b. Call `requireRole(ctx, 'role_name')` before any business logic
   c. Define required roles per endpoint in a comment or constant at the top of the handler
   d. Return `APIError('Forbidden', 'Insufficient permissions', 403)` if role check fails

3. Tenant isolation:
   a. ALL database queries must filter by `ctx.tenantId` from the auth session
   b. NEVER accept `tenantId` from the request body — it comes from the session only
   c. Pass `tenantId` to every repository call as a required parameter
   d. Log a warning if a request attempts to set `tenantId` in the body (defensive check)

4. Error handling:
   a. Use typed `APIError` classes from `./errors` (defined per domain)
   b. Map domain errors to HTTP status codes (400, 404, 409, etc.)
   c. Never expose internal error messages or stack traces to clients
   d. Log full error details server-side for debugging

5. Logging:
   a. Use structured JSON logging for all operations
   b. Include `userId`, `tenantId`, and `action` in log context
   c. Never log sensitive data (passwords, tokens, secrets)

## 5. Quality
1. Run `bunx @biomejs/biome check services/backend/src/features/{CONTEXT}/`
2. Run `bun run typecheck`
3. Generate unit tests for service layer (co-located with source)
4. Generate integration tests for API endpoints

# CONSTRAINTS
- Always validate input with Zod before processing
- Always use service layer pattern (never skip layers)
- Always handle errors with typed APIError classes
- Always use parameterized queries (Drizzle ORM enforces this)
- Always extract tenantId from auth session, never from request body
- Always check RBAC permissions before processing
- Always filter queries by tenantId for tenant isolation
- Never expose internal errors to clients
- Never skip authentication on any endpoint
- Never allow cross-tenant data access
- Never put business logic in API layer or repository layer
- Never log sensitive data (passwords, tokens, secrets)

# OUTPUT FORMAT
- API files in `services/backend/src/features/{CONTEXT}/`
- Test files co-located with source
- Biome check results
- Type check results
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill | Purpose |
|-------|---------|
| `better-auth-best-practices` | Auth middleware integration, session handling, cookie configuration |
| `better-auth-security-best-practices` | Security hardening: rate limiting, CSRF, trusted origins, session security |
| `create-auth` | Scaffolding auth packages from scratch (Step 0) |
| `email-and-password-best-practices` | Email verification, password reset, credential management |
| `turborepo` | Monorepo task orchestration and build pipeline |

---

## Usage

```bash
# Trigger via AI agent
"Generate the accounts receivable backend service"
"Generate API endpoints for invoice management"
```

---

## Related

- Standards: `engineering/backend/STANDARDS.md`, `engineering/api/STANDARDS.md`
- Agent: `code-agent.md`
- Context: `code-generation-context.md`
