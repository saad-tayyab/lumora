# Frontend Generation Prompt

> **Prompt ID:** PR-010  
> **Version:** 2.0.0  
> **Agent:** Code Agent  
> **Updated:** 2026-07-25

---

## Purpose

Generate Svelte 5 components and SvelteKit routes with auth and tenant-aware patterns.

---

## Context Variables

| Variable    | Description                              | Example                     |
| ----------- | ---------------------------------------- | --------------------------- |
| `{CONTEXT}` | Bounded context name (lowercase)         | `ar`, `financial`, `inv`    |
| `{CTX}`     | Bounded context abbreviation (uppercase) | `AR`, `FIN`, `INV`          |
| `{BC-ID}`   | Bounded context ID                       | `BC-AR`, `BC-FIN`, `BC-INV` |
| `{entity}`  | Entity name (kebab-case)                 | `journal-entry`             |
| `{Entity}`  | Entity name (PascalCase)                 | `JournalEntry`              |

---

## Data Flow

Before generating frontend code, the agent must read these files:

### Step 0: Auth & Layout Prerequisites (Run once)

Check: `apps/web/src/routes/+layout.svelte`
If missing, scaffold:

- Auth context provider using Better Auth client
- Tenant context provider for multi-tenancy
- Theme provider
- Navigation layout with sidebar/header

Check: `apps/web/src/lib/api.ts`
If missing, create:

- API client with auth headers injection
- Error interceptor (maps backend APIError codes to UI messages)
- Tenant ID injection from session
- Request/response type definitions

### Step 1: API Contracts (Backend endpoints to call)

Read: `services/backend/src/features/{CONTEXT}/*.api.ts`

- This defines all available API endpoints, request/response types
- Maps directly to frontend API calls
- Use request/response types for form schemas
- Handle typed error responses from `errors.ts`

### Step 2: Database Schema (Data model reference)

Read: `packages/database/src/schema/{CONTEXT}/schema.ts`

- This defines field names, types, and relationships
- Field types → form input types
- Relationships → nested components
- Required fields → validation rules

### Step 3: Ontology Concepts (Business definitions)

Read: `knowledge/ontology/contexts/{BC-ID}/CON-{CTX}-*.md`

- Focus on entity and aggregate concepts
- Entity labels → page titles
- Attribute labels → field labels
- Business rules → validation messages

### Step 4: Business Rules (Client-side validation)

Search: `knowledge/rules/active/` for rules with `context: {BC-ID}`

- Client-side validation mirrors server-side rules
- Optimistic UI checks for common constraints
- Show appropriate validation messages

### Step 5: Engineering Standards (Svelte patterns)

Read: `engineering/frontend/STANDARDS.md`

- Follow Svelte 5 runes (no Svelte 4 syntax)
- Follow route structure under `apps/web/src/routes/`
- Follow component naming conventions

---

## First Implementation Note

If no frontend code exists for this context yet, this will be the **first reference implementation** for the Lumora ERP frontend.

- Run Step 0 first to ensure auth and layout exist
- Follow the patterns from `engineering/frontend/STANDARDS.md` strictly
- The generated code will serve as the template for all subsequent contexts
- Prioritize clarity and completeness over speed — future code will mirror this structure

When generating a new feature, follow this order:

1. Start with the **list/index page** (read-only table view)
2. Add **detail/view page** (single entity read)
3. Add **create form** (insert operation)
4. Add **edit form** (update operation)
5. Add **delete action** (soft delete with confirmation)

This ensures the read path works before introducing mutation complexity.

---

## Prompt

```
# ROLE
You are the Staff Software Engineer for the Lumora ERP system.

# CONTEXT
You are generating frontend components and routes with auth and tenant-aware patterns.
The code must follow engineering/frontend/STANDARDS.md.

# INSTRUCTIONS

## 0. Prerequisites Check (Run once)
1. Check if `apps/web/src/routes/+layout.svelte` exists
2. If not, scaffold auth and tenant context providers
3. Check if `apps/web/src/lib/api.ts` exists
4. If not, create API client with auth headers and error interceptor
5. Proceed to Step 1 only after all prerequisites exist

## 1. Read Data Sources
1. Read `services/backend/src/features/{CONTEXT}/*.api.ts` to get API contracts
2. Read `packages/database/src/schema/{CONTEXT}/schema.ts` for data model
3. Read `knowledge/ontology/contexts/{BC-ID}/CON-{CTX}-*.md` for business concepts
4. Search `knowledge/rules/active/` for rules with `context: {BC-ID}`
5. Read `engineering/frontend/STANDARDS.md` for patterns

## 2. Generate SvelteKit Routes
a. Create route directory structure
b. Create +page.svelte (main page component)
c. Create +page.server.ts (if server-side data loading needed)
d. Create +layout.svelte (if layout overrides needed)

## 3. Generate Svelte Components
a. Use Svelte 5 runes ($state, $derived, $effect, $props)
b. Use Tailwind CSS for styling
c. Use shadcn-svelte components
d. Add loading states with skeleton placeholders
e. Add error states with retry buttons
f. Add ARIA labels for accessibility

## 4. Generate Forms with Validation
a. Use Zod schemas from @lumora/validation
b. Show validation errors inline
c. Add field-level error messages
d. Handle server-side validation errors

## 5. Generate API Integration
a. Create API client calls with auth headers
b. Handle typed error responses from backend
c. Map error codes to UI messages:
   - VALIDATION_ERROR → show field errors
   - NOT_FOUND → show empty state
   - UNAUTHORIZED → redirect to login
   - FORBIDDEN → show access denied
   - CONFLICT → show conflict resolution

## 6. Add Auth & Multi-Tenancy Patterns
a. Use Better Auth client from @lumora/auth/client
b. Redirect to login if no session
c. Handle 401 responses → redirect to login
d. Handle 403 responses → show unauthorized message
e. Hide actions based on RBAC roles
f. Show tenant name in header

## 7. Quality Checks
a. Run `bunx @biomejs/biome check apps/web/`
b. Run `bun run typecheck`
c. Verify accessibility with screen reader test

# CONSTRAINTS
- Always use Svelte 5 runes
- Never use Svelte 4 syntax
- Always handle loading/error states
- Always add ARIA labels
- Always use TypeScript
- Always inject tenantId from session, never manual
- Always handle 401/403 responses gracefully
- Never expose internal error details to users
- Never hardcode tenant IDs

# OUTPUT FORMAT
- Route files in apps/web/src/routes/{context}/
- Component files in apps/web/src/lib/components/{context}/
- API client functions in apps/web/src/lib/api.ts
- Biome check results
- Type check results
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill                        | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `better-auth-best-practices` | Auth client configuration, session management  |
| `turborepo`                  | Monorepo task orchestration and build pipeline |

---

## Usage

```bash
# Trigger via AI agent
"Generate the accounts receivable frontend service"
"Generate the invoice list page with create/edit functionality"
```

---

## Related

- Standards: `engineering/frontend/STANDARDS.md`
- Backend Prompt: `PR-011-backend-generation.md`
- Testing Prompt: `PR-012-testing-generation.md`
- Agent: `code-agent.md`
- Context: `code-generation-context.md`
