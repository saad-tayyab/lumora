# Ingest Command

> **Command ID:** CMD-001  
> **Purpose:** Ingest a document into the knowledge repository  
> **Version:** 2.0.0

---

## Usage

```bash
bun .ai/commands/ingest.sh <file-path> [context]
```

## Arguments

| Argument    | Required | Description                                   |
| ----------- | -------- | --------------------------------------------- |
| `file-path` | yes      | Path to the document to ingest                |
| `context`   | no       | Target bounded context (default: auto-detect) |

## Example

```bash
bun .ai/commands/ingest.sh ./references/textbook.pdf BC-FIN
```

## What It Does

This command triggers the PDF Ingestion Orchestrator (PR-002a), which:

1. **Validates** input file exists and is a supported format
2. **Parses** the PDF — extracts chapter boundaries and text
3. **Builds ontology snapshot** — scans existing knowledge for dedup
4. **Dispatches chapter subagents** — spawns 3–5 concurrent extractors
5. **Collects artifacts** — gathers all chapter outputs
6. **Deduplicates** — cross-chapter deduplication and merging
7. **Assigns IDs** — sequential CON/BR/REL IDs across all chapters
8. **Writes to knowledge repo** — creates concept, rule, glossary files
9. **Updates graph + manifests** — rebuilds graph and all manifests
10. **Validates** — orphan detection, link validation, naming checks
11. **Reports** — generates ingestion report in knowledge/reports/

## Architecture

```
Ingest Command
  ↓
Orchestrator Agent (PR-002a)
  ├→ Chapter Subagent 1 (PR-002b)
  ├→ Chapter Subagent 2 (PR-002b)
  ├→ Chapter Subagent N (PR-002b)
  ↓
Merger + Dedup
  ↓
Writer
  ↓
Graph + Manifest Updater
  ↓
Validator
  ↓
Report
```

## Output

Report the number of:

- Chapters processed
- Concepts extracted (new / duplicates merged)
- Rules extracted (new / duplicates merged)
- Glossary terms added (new / duplicates merged)
- Relationships created
- Validation results (pass / warnings / errors)
- Ingestion report path

## Error Handling

| Error                 | Action                           |
| --------------------- | -------------------------------- |
| File not found        | Exit with error message          |
| PDF parsing fails     | Retry once, then report failure  |
| Subagent timeout      | Skip chapter, report in warnings |
| Dedup conflict        | Flag for human review            |
| YAML validation fails | Report which files need fixing   |

## Related

- Prompt: `PR-002-pdf-ingestion.md`
- Playbook: `pb-002-pdf-ingestion.md`
