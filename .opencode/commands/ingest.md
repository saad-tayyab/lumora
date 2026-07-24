---
description: Ingest a PDF document into the knowledge repository (parallel subagent architecture)
agent: knowledge-extractor
---

Ingest the following PDF document into the knowledge repository:

$ARGUMENTS

## Architecture

This command uses a parallel subagent architecture for large PDFs:

```
Orchestrator → Chapter Subagents (3–5 concurrent) → Merge → Dedup → Write → Validate
```

## Steps

1. Parse PDF and extract chapter boundaries
2. Build ontology snapshot of existing knowledge
3. Dispatch chapter subagents (one per chapter, batched 3–5)
4. Collect chapter artifacts (JSON)
5. Cross-chapter deduplication
6. Assign final sequential IDs (CON/BR/REL)
7. Write concept files to knowledge/ontology/{CONTEXT}/
8. Write rule files to knowledge/rules/active/
9. Write glossary files to knowledge/glossary/
10. Rebuild knowledge graph and update manifests
11. Run validation checklist (orphans, links, duplicates, YAML)
12. Generate ingestion report in knowledge/reports/

## Output

Report:

- Chapters processed
- Concepts extracted (new / duplicates merged)
- Rules extracted (new / duplicates merged)
- Glossary terms (new / duplicates merged)
- Relationships created
- Validation results
- Report file path

## Error Handling

- Subagent failures are isolated per chapter
- Dedup conflicts flagged for human review
- Partial ingestion can be resumed from last completed phase
