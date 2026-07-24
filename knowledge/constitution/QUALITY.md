# Quality Gates

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** QA Agent

---

## 1. Purpose

This document defines the quality gates that all artifacts must pass before being considered complete.

---

## 2. Quality Gates

### 2.1 No Duplicated Concepts

Every concept must be unique across the entire knowledge repository.

**Check:** Scan all ontology files for duplicate concept IDs and names.

### 2.2 No Duplicated Business Rules

Every business rule must be unique.

**Check:** Scan all rule files for duplicate rule IDs and similar statements.

### 2.3 No Broken Links

Every cross-reference must resolve to an existing file.

**Check:** Scan all markdown files for internal links and verify they resolve.

### 2.4 No Orphan Ontology Nodes

Every concept must have at least one relationship.

**Check:** Scan ontology for concepts with no incoming or outgoing relationships.

### 2.5 No Missing README

Every directory must have a README.md.

**Check:** Scan all directories for README.md files.

### 2.6 No Missing Metadata

Every artifact must have YAML front matter with required fields.

**Check:** Scan all markdown files for valid YAML front matter.

### 2.7 Consistent Terminology

All artifacts must use terminology from the glossary.

**Check:** Compare terms used in artifacts against glossary entries.

### 2.8 Machine-Readable

All data must be available in machine-readable formats.

**Check:** Verify YAML manifests and JSON graph files exist and are valid.

### 2.9 Git-Friendly

All files must be text-based and diffable.

**Check:** No binary files in knowledge repository.

### 2.10 LLM-Friendly

All files must be readable by language models.

**Check:** No complex formatting that would confuse LLMs.

---

## 3. Running Quality Gates

```bash
# Run all quality gates
bun run tooling/validate.ts

# Run Biome check
bunx @biomejs/biome check .

# Run type check
bun run typecheck

# Run tests
bun run test
```

---

## 4. Quality Gate Results

Results are stored in:
- `knowledge/manifests/orphans.yml` — Orphan detection
- `knowledge/manifests/links.yml` — Link validation
- CI pipeline — Automated checks on every PR

---

## 5. Escalation

If a quality gate fails:
1. Fix the issue
2. Re-run validation
3. If issue cannot be fixed, escalate to human reviewer
