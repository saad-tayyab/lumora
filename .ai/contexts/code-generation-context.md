# Code Generation Context

> **Context ID:** CTX-CODE-001  
> **Purpose:** Context for generating production code  
> **Version:** 1.0.0

---

## When to Use

When generating TypeScript, Svelte, or database code from specifications.

## Required References

| Reference | Path |
|-----------|------|
| Engineering Constitution | `knowledge/constitution/ENGINEERING.md` |
| Code Agent | `.ai/agents/code-agent.md` |
| Backend Standards | `engineering/backend/` |
| Frontend Standards | `engineering/frontend/` |
| Database Standards | `engineering/database/` |
| API Standards | `engineering/api/` |
| Testing Standards | `engineering/testing/` |

## Context Variables

- `FEATURE_NAME`: Name of the feature being built
- `BOUNDED_CONTEXT`: Target bounded context
- `CONCEPT_IDS`: List of relevant concept IDs
- `RULE_IDS`: List of applicable business rules
- `EXISTING_PATTERNS`: Reference to similar existing code

## Output Checklist

- [ ] Biome check passes
- [ ] Types are explicit (no `any`)
- [ ] Error handling is present
- [ ] Tests are generated
- [ ] Documentation is updated
