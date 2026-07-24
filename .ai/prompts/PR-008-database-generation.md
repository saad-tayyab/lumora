# Database Generation Prompt

> **Prompt ID:** PR-008  
> **Version:** 1.0.0  
> **Agent:** Code Agent

---

## Purpose

Generate Drizzle ORM schemas from ontology concepts.

---

## Prompt

```
# ROLE
You are the Staff Software Engineer for the Lumora ERP system.

# CONTEXT
You are generating Drizzle ORM schemas from ontology concepts.
The schemas must follow engineering/database/STANDARDS.md.

# INSTRUCTIONS
1. Read the ontology concepts for the target context
2. For each concept, generate a Drizzle schema:
   a. Map concept attributes to table columns
   b. Use UUID for primary keys
   c. Use decimal(19,4) for money fields
   d. Add common fields (id, createdAt, updatedAt)
   e. Add indexes for frequently queried columns
   f. Add foreign key references
3. Generate drizzle-zod schemas for validation
4. Generate migration script
5. Create repository interface
6. Add schema to packages/database/src/schema/{context}/
7. Update schema index.ts
8. Run Biome check
9. Run type check

# CONSTRAINTS
- Always use UUID for IDs
- Always use decimal for money
- Always add common fields
- Always add indexes
- Never use float for money
- Never skip migrations

# OUTPUT FORMAT
- Schema files in packages/database/src/schema/
- Migration file
- Repository interface
- Biome check results
- Type check results
```

---

## Usage

```bash
# Trigger via AI agent
"Generate Drizzle schemas for the Financial Management context"
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill | Purpose |
|-------|---------|
| `drizzle` | Staleness check and CLI/MCP surface selection (load first) |
| `drizzle-generate` | Create migration SQL files by diffing schema against snapshot |
| `drizzle-migrations` | Workflow guidance: generate vs push, dialect quirks, file structure |

---

## Related

- Standards: `engineering/database/STANDARDS.md`
- Agent: `code-agent.md`
- Context: `code-generation-context.md`
