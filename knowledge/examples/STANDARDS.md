# Examples Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Staff Engineer  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This directory contains reference implementations and examples that demonstrate how knowledge artifacts are created and used.

---

## 2. Example Types

| Type | Purpose |
|------|---------|
| `concept-example` | Fully defined concept with all sections |
| `rule-example` | Business rule with implementation |
| `workflow-example` | Complete workflow with diagram |
| `ingestion-example` | Sample knowledge ingestion output |

---

## 3. Example File Format

```markdown
---
id: EX-001
name: Example Concept Definition
type: concept-example
version: 1.0.0
---

# Example: Defining a Concept

This example demonstrates how to create a properly formatted concept definition.

## Steps
1. Create file with correct naming convention
2. Add YAML front matter with all required fields
3. Write Definition, Attributes, Relationships, Invariants
4. Link to related rules and workflows
5. Run validation checklist

## Result
See [CON-FIN-001](../ontology/contexts/BC-FIN/CON-FIN-001.chart-of-accounts.md)
```

---

## 4. File Organization

```
knowledge/examples/
├── STANDARDS.md
├── concept-example.md
├── rule-example.md
├── workflow-example.md
├── glossary-example.md
├── report-example.md
└── ingestion-example.md
```

---

## 5. Naming Convention

| Element | Convention | Example |
|---------|-----------|---------|
| Files | `{type}-example.md` | `concept-example.md` |
| IDs | `EX-{NUM}` | `EX-001` |
