# Knowledge Extraction Context

> **Context ID:** CTX-KNOW-001  
> **Purpose:** Context for extracting knowledge from source documents  
> **Version:** 1.0.0

---

## When to Use

When ingesting source documents (textbooks, standards, regulations) into the knowledge repository.

## Required References

| Reference | Path |
|-----------|------|
| Domain Agent | `.ai/agents/domain-agent.md` |
| Ontology Standards | `knowledge/ontology/STANDARDS.md` |
| Rules Standards | `knowledge/rules/STANDARDS.md` |
| Glossary Standards | `knowledge/glossary/STANDARDS.md` |
| Graph Standards | `knowledge/graph/STANDARDS.md` |
| PDF Ingestion Playbook | `.ai/playbooks/pb-002-pdf-ingestion.md` |

## Context Variables

- `SOURCE_DOCUMENT`: Path to the source document
- `CHAPTER_RANGE`: Chapters to process
- `TARGET_CONTEXT`: Bounded context to extract into
- `EXISTING_ONTOLOGY`: Current ontology state

## Output Checklist

- [ ] Concepts follow naming convention
- [ ] No duplicate concepts
- [ ] Rules are linked to concepts
- [ ] Glossary terms are defined
- [ ] Graph is updated
- [ ] Manifests are updated
