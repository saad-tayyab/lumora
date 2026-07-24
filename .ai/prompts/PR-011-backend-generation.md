# Backend Generation Prompt

> **Prompt ID:** PR-011  
> **Version:** 3.0.0  
> **Agent:** Code Agent

---

## Purpose

Generate Encore.ts backend services including API endpoints, service layer, and repository layer from specifications. Merged from PR-009 (API Generation) and PR-011 (Backend Generation).

---

## Context Variables

| Variable | Meaning | Mapping |
|----------|---------|---------|
| `{CONTEXT}` | Directory-level context name (lowercase) | `ar`, `financial`, `inv`, `ap`, `cash`, `auth`, `hr`, `proc`, `sales`, `report`, `ai` |
| `{CTX}` | Uppercase bounded context prefix | `AR`, `FIN`, `INV`, `AP`, `CASH`, `AUTH`, `HR`, `PROC`, `SALES`, `REPORT`, `AI` |
| `{BC-ID}` | Bounded context ID from DOMAIN.md | `BC-AR`, `BC-FIN`, `BC-INV`, `BC-AP`, `BC-CASH`, `BC-AUTH`, `BC-HR`, `BC-PROC`, `BC-SALES`, `BC-REPORT`, `BC-AI` |

Example: For Accounts Receivable → `{CONTEXT}` = `ar`, `{CTX}` = `AR`, `{BC-ID}` = `BC-AR`.

---

## Data Flow

Before generating code, the agent must read these files in order:

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

- Follow the patterns from `engineering/backend/STANDARDS.md` strictly
- The generated code will serve as the template for all subsequent contexts
- Prioritize clarity and completeness over speed — future code will mirror this structure
- Include all layers (API, service, repository, types, errors) even if some are thin

---

## Prompt

```
# ROLE
You are the Staff Software Engineer for the Lumora ERP system.

# CONTEXT
You are generating a complete backend service for a bounded context.
The code must follow engineering/backend/STANDARDS.md and engineering/api/STANDARDS.md.

# INSTRUCTIONS

## 1. Read Data Sources
1. Read `packages/database/src/schema/{CONTEXT}/schema.ts` to get the table definitions
2. Read all files matching `knowledge/ontology/contexts/{BC-ID}/CON-{CTX}-*.md` for business concepts
3. Search `knowledge/rules/active/` for rules with `context: {BC-ID}` for validation logic
4. Read `engineering/backend/STANDARDS.md` and `engineering/api/STANDARDS.md` for patterns
5. Check `services/backend/src/features/{CONTEXT}/` for existing code to match

## 2. API Endpoint Design
1. Design CRUD endpoints for each entity in the schema:
   a. GET /resources (list with pagination)
   b. GET /resources/:id (get by ID)
   c. POST /resources (create)
   d. PUT /resources/:id (update)
   e. DELETE /resources/:id (soft delete)
2. For each endpoint:
   a. Define request schema with Zod (use drizzle-orm/zod to derive from schema)
   b. Define response schema
   c. Define error responses (use structured error codes from `errors.ts`)
   d. Add authentication (Better Auth session)
   e. Add authorization (RBAC)
   f. Add input validation (enforce business rules from Step 3)

## 3. Generate Service Files
Generate all files in `services/backend/src/features/{CONTEXT}/`:

1. `api.ts` — API definitions using Encore.ts `api()`. Input validation, HTTP concerns, Encore.ts Handler types. Import from `./service`, `./types`, `./errors`.

2. `service.ts` — Business logic and orchestration. Domain rule enforcement. Import from `./repo`, `./types`, `./errors`. Call repository for data access.

3. `repo.ts` — Data access layer with Drizzle ORM. Import `db` from `@lumora/database`. Use parameterized queries only. Use transactions where needed. Import table definitions from `packages/database/src/schema/{CONTEXT}/schema.ts`.

4. `types.ts` — TypeScript types and Zod schemas. Derive from Drizzle schema using `drizzle-orm/zod`. Export request/response types.

5. `errors.ts` — Typed domain errors extending `APIError`. One error class per domain error. Include error code and HTTP status.

## 4. Middleware
1. Authentication: Better Auth session validation on all endpoints
2. Authorization: Role-based access control (check user roles from session)
3. Error handling: Structured error responses (use errors from `errors.ts`)
4. Logging: Structured JSON logging

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
- Never expose internal errors to clients
- Never skip authentication on any endpoint
- Never put business logic in API layer or repository layer

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
| `create-auth` | If scaffolding auth for the first time in this service |

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
