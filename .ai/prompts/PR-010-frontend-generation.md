# Frontend Generation Prompt

> **Prompt ID:** PR-010  
> **Version:** 1.1.0  
> **Agent:** Code Agent

---

## Purpose

Generate Svelte 5 components and SvelteKit routes.

---

## Context Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{CONTEXT}` | Bounded context name (PascalCase) | `Financial` |
| `{CTX}` | Bounded context abbreviation (uppercase) | `FIN` |
| `{context}` | Bounded context name (kebab-case) | `financial` |
| `{entity}` | Entity name (kebab-case) | `journal-entry` |
| `{Entity}` | Entity name (PascalCase) | `JournalEntry` |

---

## Data Flow

Before generating frontend code, the agent must read these files:

### Step 1: API Contracts (Backend endpoints to call)

Read: `services/backend/src/features/{context}/*.api.ts`

- This defines all available API endpoints, request/response types
- Use this to generate API client calls and form submissions

### Step 2: Database Schema (Data model reference)

Read: `packages/database/src/schema/{context}/schema.ts`

- This defines field names, types, and relationships
- Use this to generate form fields and list columns

### Step 3: Ontology Concepts (Business definitions)

Read: `knowledge/ontology/contexts/{CONTEXT}/CON-{CTX}-*.md`

- Focus on entity and aggregate concepts
- Use this for page titles, field labels, and validation messages

### Step 4: Engineering Standards (Svelte patterns)

Read: `engineering/frontend/STANDARDS.md`

- Follow Svelte 5 runes (no Svelte 4 syntax)
- Follow route structure under `apps/web/src/routes/`
- Follow component naming conventions

---

## First Implementation Note

When generating a new feature for the first time, follow this order:

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
You are generating frontend components and routes.
The code must follow engineering/frontend/STANDARDS.md.

# INSTRUCTIONS
1. Read the API contracts and design specs
2. Generate SvelteKit routes:
   a. Create route directory
   b. Create +page.svelte
   c. Create +page.server.ts (if needed)
   d. Create +layout.svelte (if needed)
3. Generate Svelte components:
   a. Use Svelte 5 runes ($state, $derived, $effect, $props)
   b. Use Tailwind CSS for styling
   c. Use shadcn-svelte components
   d. Add loading states
   e. Add error states
   f. Add ARIA labels
4. Generate form validation:
   a. Use Zod schemas from @lumora/validation
   b. Show validation errors
5. Generate API client calls
6. Add accessibility features
7. Run Biome check
8. Run type check

# CONSTRAINTS
- Always use Svelte 5 runes
- Never use Svelte 4 syntax
- Always handle loading/error states
- Always add ARIA labels
- Always use TypeScript

# OUTPUT FORMAT
- Route files in apps/web/src/routes/
- Component files in apps/web/src/lib/components/
- Biome check results
- Type check results
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill | Purpose |
|-------|---------|
| `turborepo` | Monorepo task orchestration and build pipeline |

---

## Usage

```bash
# Trigger via AI agent
"Generate the invoice list page with create/edit functionality"
```

---

## Related

- Standards: `engineering/frontend/STANDARDS.md`
- Agent: `code-agent.md`
- Context: `code-generation-context.md`
