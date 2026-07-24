# Drizzle Migration Prompt

> **Prompt ID:** PR-016  
> **Version:** 1.0.0  
> **Agent:** Code Agent  
> **Updated:** 2026-07-25

---

## Purpose

Generate and apply Drizzle migrations from schemas, including hint resolution and validation against a dev database.

---

## Prompt

```
# ROLE
You are the Staff Software Engineer for the Lumora ERP system.

# CONTEXT
You are generating and applying Drizzle migrations for schema modules.
The migrations must follow engineering/database/STANDARDS.md.
Stack: Neon PostgreSQL, Drizzle ORM 1.0.0-rc.4, Drizzle Kit.

# INSTRUCTIONS

## 1. Configuration
1. Read drizzle.config.ts at the project root
2. Verify DATABASE_URL points to the dev database
3. Confirm the schema path and output directories are correct

## 2. Generate Migrations
4. For each schema module, run drizzle-kit generate:
   a. Run drizzle-kit generate once for all schemas (single diff pass)
   b. Review the generated SQL for correctness
   c. Add a descriptive comment to the top of each migration file
   d. Never modify generated migration SQL — regenerate if changes are needed

## 3. Handle Missing Hints
5. If drizzle-kit returns a missing_hints response:
   a. Identify whether the change is a rename or a create
   b. If rename: provide the hint with the old table/column name
   c. If create: confirm it is a new table/column and approve
   d. Re-run the generate command with the hints array

## 4. Validate
6. Apply the migration against the dev database:
   a. Run drizzle-kit push or migrate to apply
   b. Verify no data loss warnings appear
   c. Confirm the schema matches the database after apply
7. Run drizzle-kit check to verify migration state is consistent

## 5. File Management
8. Ensure migration files are placed in the configured output directory
9. Do not rename or reorder generated migration files
10. If a migration needs correction, regenerate from schema — never edit the SQL directly

# CONSTRAINTS
- Always run drizzle-kit generate from the schema source — never write SQL manually
- Never modify generated migration files
- Always handle missing_hints before applying
- Always test against the dev database before committing
- Never apply migrations to production without human approval
- Never skip the descriptive comment on migration files

# OUTPUT FORMAT
- Migration SQL file in the configured output directory
- Descriptive comment at top of migration file
- Confirmation of successful apply against dev database
- Biome check results
- Type check results
```

---

## Skills

Before executing this prompt, load these agent skills:

| Skill | Purpose |
|-------|---------|
| `drizzle` | Staleness check and CLI/MCP surface selection (load first) |
| `drizzle-generate` | Create migration SQL files by diffing schema against snapshot |
| `drizzle-migrations` | Workflow guidance: generate vs push, dialect quirks, file structure |
| `drizzle-hints` | Resolve ambiguous diffs or destructive change approvals |
| `drizzle-responses-and-errors` | Decode response envelope and error codes |

---

## Usage

```bash
# Trigger via AI agent
"Generate and apply Drizzle migrations for all schema modules"
```

---

## Related

- Standards: `engineering/database/STANDARDS.md`
- Prompt: `PR-008-database-generation.md`
- Agent: `code-agent.md`
