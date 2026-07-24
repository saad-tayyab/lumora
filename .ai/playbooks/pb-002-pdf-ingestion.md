# PDF Ingestion Playbook

> **Playbook ID:** PB-002  
> **Version:** 1.0.0  
> **Owner:** AI Systems Engineer

---

## Purpose

Step-by-step guide for ingesting a PDF document (e.g., accounting textbook) into the knowledge repository.

---

## Prerequisites

- PDF file available
- Domain Agent configured
- Knowledge repository initialized

## Pipeline

```
PDF Input
  ↓
Chapter Extraction
  ↓
Knowledge Extraction
  ↓
Normalization
  ↓
Deduplication
  ↓
Ontology Update
  ↓
Graph Update
  ↓
Business Rule Extraction
  ↓
Workflow Generation
  ↓
Validation
```

## Steps

### Step 1: Chapter Extraction
1. Load PDF
2. Extract chapter boundaries
3. Identify chapter titles and structure
4. Output: List of chapters with metadata

### Step 2: Knowledge Extraction
For each chapter:
1. Identify domain concepts
2. Identify business rules
3. Identify relationships
4. Identify glossary terms
5. Identify workflows

### Step 3: Normalization
1. Map extracted concepts to ontology format
2. Assign concept IDs following convention
3. Validate against existing concepts
4. Apply YAML front matter template

### Step 4: Deduplication
1. Check new concepts against existing ontology
2. Flag potential duplicates for review
3. Merge or reject duplicates
4. Update cross-references

### Step 5: Ontology Update
1. Add new concepts to `knowledge/ontology/`
2. Add new relationships to `knowledge/ontology/relationships/`
3. Add new constraints to `knowledge/ontology/constraints/`
4. Update `knowledge/ontology/INDEX.md`
5. Update `knowledge/manifests/concepts.yml`

### Step 6: Graph Update
1. Add new nodes to `knowledge/graph/graph.yaml`
2. Add new edges to `knowledge/graph/graph.yaml`
3. Regenerate `knowledge/graph/graph.json`
4. Update Mermaid diagrams
5. Update `knowledge/graph/INDEX.md`

### Step 7: Business Rule Extraction
1. Create rule files in `knowledge/rules/active/`
2. Follow rule format from `knowledge/rules/STANDARDS.md`
3. Link rules to concepts
4. Update `knowledge/rules/INDEX.md`
5. Update `knowledge/manifests/rules.yml`

### Step 8: Validation
1. Run validation checklist from each STANDARDS.md
2. Check for orphans
3. Check for broken links
4. Check for duplicates
5. Run QA Agent

## Output

Updated knowledge repository with new:
- Concepts in ontology
- Business rules
- Glossary entries
- Graph nodes and edges
- Updated manifests
