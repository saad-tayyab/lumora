# Manifest Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Knowledge Engineer  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines metadata catalogs (manifests) that index all knowledge artifacts. Manifests enable discovery, validation, and tooling.

---

## 2. Manifest Types

| Manifest | Purpose |
|----------|---------|
| `concepts.yml` | Index of all ontology concepts |
| `rules.yml` | Index of all business rules |
| `workflows.yml` | Index of all workflows |
| `glossary.yml` | Index of all glossary terms |
| `reports.yml` | Index of all report definitions |
| `graph.yml` | Knowledge graph statistics |
| `orphans.yml` | Orphan detection results |
| `links.yml` | Cross-reference integrity |

---

## 3. Concepts Manifest

```yaml
---
manifest: concepts
version: 1.0.0
last_updated: 2026-07-24
total: 0
by_context:
  BC-AUTH: 0
  BC-FIN: 0
  BC-AR: 0
  BC-AP: 0
  BC-CASH: 0
  BC-INV: 0
  BC-PROC: 0
  BC-SALES: 0
  BC-HR: 0
  BC-REPORT: 0
  BC-AI: 0
concepts: []
---
```

---

## 4. Rules Manifest

```yaml
---
manifest: rules
version: 1.0.0
last_updated: 2026-07-24
total: 0
by_context:
  BC-FIN: 0
  BC-AR: 0
  BC-AP: 0
  BC-INV: 0
  BC-PROC: 0
  BC-SALES: 0
  BC-HR: 0
  BC-CASH: 0
by_priority:
  critical: 0
  high: 0
  medium: 0
  low: 0
by_type:
  invariant: 0
  constraint: 0
  validation: 0
  business_process: 0
  computational: 0
  temporal: 0
  access_control: 0
rules: []
---
```

---

## 5. Workflows Manifest

```yaml
---
manifest: workflows
version: 1.0.0
last_updated: 2026-07-24
total: 0
by_context: {}
by_type:
  process: 0
  automation: 0
  approval: 0
  integration: 0
  validation: 0
workflows: []
---
```

---

## 6. Manifest Organization

```
knowledge/manifests/
├── STANDARDS.md
├── concepts.yml
├── rules.yml
├── workflows.yml
├── glossary.yml
├── reports.yml
├── graph.yml
├── orphans.yml
└── links.yml
```

---

## 7. Manifest Update Rules

1. Manifests are regenerated on every CI run.
2. Manifests must never be edited manually.
3. Manifest changes trigger graph rebuilds.
4. Orphan detection runs against manifests.
5. Link validation runs against manifests.

---

## 8. Validation Checklist

- [ ] Manifest format is valid YAML
- [ ] All entries reference existing files
- [ ] Counts match actual file counts
- [ ] No orphans detected
- [ ] No broken links detected
- [ ] Last updated timestamp is current
