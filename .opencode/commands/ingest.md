---
description: Ingest a PDF document into the knowledge repository
agent: knowledge-extractor
---

Ingest the following PDF document into the knowledge repository:

$ARGUMENTS

## Steps

1. Read the PDF file
2. Extract chapter boundaries
3. For each chapter, extract:
   - Domain concepts (CON-{CTX}-{NUM})
   - Business rules (BR-{NUM})
   - Relationships (REL-{NUM})
   - Glossary terms
4. Check for duplicates
5. Create artifact files following STANDARDS.md
6. Update INDEX.md files
7. Update manifests
8. Run validation checklist

## Output

Report the number of:
- Concepts extracted
- Rules extracted
- Relationships created
- Glossary terms added
- Duplicates found and skipped
