# Long-term: Project Conventions

> **ID:** MEM-LT-001  
> **Type:** Long-term  
> **Date:** 2026-07-24  
> **Agent:** System

---

## Established Conventions

### Naming
- Concept IDs: `CON-{CTX}-{NUM}`
- Rule IDs: `BR-{NUM}`
- Workflow IDs: `WF-{CTX}-{NUM}`
- Relationship IDs: `REL-{NUM}`
- Constraint IDs: `CTR-{CTX}-{NUM}`
- Report IDs: `RPT-{CTX}-{NUM}`
- Reference IDs: `REF-{NUM}`
- Example IDs: `EX-{NUM}`

### File Naming
- Concepts: `CON-{CTX}-{NUM}.{kebab-name}.md`
- Rules: `BR-{NUM}.{kebab-name}.md`
- Workflows: `WF-{CTX}-{NUM}.{kebab-name}.md`
- Glossary: `{kebab-case-term}.md`

### Technology
- Linter/Formatter: Biome (not ESLint/Prettier)
- Runtime: Bun
- Monorepo: Turborepo
- Frontend: Svelte 5 + SvelteKit
- Backend: Encore.ts
- Database: Neon PostgreSQL + Drizzle ORM

### Documentation
- Every directory has README.md
- Every package has AI.md
- Every knowledge artifact has YAML front matter
- Every artifact has a validation checklist
