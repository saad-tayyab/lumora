# Knowledge Consolidation Playbook

> **Playbook ID:** PB-004  
> **Version:** 1.0.0  
> **Owner:** AI Systems Engineer

---

## Purpose

Step-by-step guide for consolidating and validating the knowledge repository after changes.

---

## Prerequisites

- Knowledge repository has been modified
- All artifacts follow STANDARDS.md

## Steps

### Step 1: Manifest Regeneration
```bash
# Regenerate all manifests from source files
# This is done by the Domain Agent
```

1. Scan all ontology files → update `concepts.yml`
2. Scan all rule files → update `rules.yml`
3. Scan all workflow files → update `workflows.yml`
4. Scan all glossary files → update `glossary.yml`
5. Scan all report files → update `reports.yml`
6. Update `graph.yml` from `graph.yaml`

### Step 2: Orphan Detection
1. Find concepts with no relationships
2. Find rules with no linked concepts
3. Find workflows with no linked rules
4. Find glossary terms with no linked concepts
5. Output: `orphans.yml`

### Step 3: Link Validation
1. Check all cross-references resolve
2. Check all concept IDs exist
3. Check all rule IDs exist
4. Check all workflow IDs exist
5. Output: `links.yml`

### Step 4: Duplicate Detection
1. Check for concepts with similar names
2. Check for rules with similar statements
3. Check for glossary terms with similar definitions
4. Flag potential duplicates for review

### Step 5: Consistency Check
1. Validate all artifacts follow naming conventions
2. Validate all YAML front matter is valid
3. Validate all required sections are present
4. Validate version numbers are consistent

### Step 6: Graph Rebuild
1. Rebuild `graph.yaml` from all artifacts
2. Regenerate `graph.json`
3. Update Mermaid diagrams
4. Validate graph integrity

## Output

- Updated manifests
- Orphan report
- Link validation report
- Duplicate report
- Updated knowledge graph
