# Ingest Command

> **Command ID:** CMD-001  
> **Purpose:** Ingest a document into the knowledge repository  
> **Version:** 1.0.0

---

## Usage

```bash
bun .ai/commands/ingest.sh <file-path> [context]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `file-path` | yes | Path to the document to ingest |
| `context` | no | Target bounded context (default: auto-detect) |

## Example

```bash
bun .ai/commands/ingest.sh ./references/accounting-textbook.pdf BC-FIN
```

## What It Does

1. Validates input file exists
2. Loads Domain Agent
3. Loads Knowledge Extraction Context
4. Executes PDF Ingestion Playbook
5. Runs validation checklist
6. Updates manifests
7. Reports results

## Output

- New ontology concepts
- New business rules
- Updated graph
- Updated manifests
- Ingestion report
