---
description: Generate code from knowledge repository artifacts
agent: code-generator
---

Generate production code for the following feature:

$ARGUMENTS

## Steps

1. Read the feature specification
2. Look up relevant concepts from `knowledge/ontology/`
3. Look up relevant rules from `knowledge/rules/`
4. Generate:
   - Database schema (Drizzle ORM)
   - API endpoints (Encore.ts)
   - Frontend components (Svelte 5)
   - Tests (Vitest)
5. Run Biome check
6. Update documentation

## Output

Report:
- Files created
- Files modified
- Biome check result
- Test results
