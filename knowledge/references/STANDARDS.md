# References Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Technical Writer  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This directory stores references to external sources, documents, and materials used to build the knowledge repository.

---

## 2. Reference Types

| Type | Description | Example |
|------|-------------|---------|
| `textbook` | Educational material | Accounting textbook |
| `standard` | Industry standards | IFRS, GAAP |
| `regulation` | Legal requirements | Tax regulations |
| `documentation` | Software docs | Drizzle ORM docs |
| `article` | Blog posts, papers | Architecture articles |

---

## 3. Reference File Format

```yaml
---
id: REF-001
name: Accounting Principles Textbook
type: textbook
author: "Author Name"
title: "Accounting Principles"
edition: "12th Edition"
year: 2024
publisher: "Publisher Name"
isbn: "978-0-00-000000-0"
url: ""
status: active
version: 1.0.0
chapters:
  - chapter: 1
    title: "Introduction to Accounting"
    concepts_extracted: 0
    rules_extracted: 0
  - chapter: 2
    title: "The Accounting Equation"
    concepts_extracted: 0
    rules_extracted: 0
---

# Accounting Principles Textbook

## Overview
Primary reference for accounting knowledge extraction.

## Usage
Used by the Knowledge Ingestion Pipeline to extract business rules and concepts.

## Extraction Status
- Total chapters: 0
- Chapters processed: 0
- Concepts extracted: 0
- Rules extracted: 0
```

---

## 4. File Organization

```
knowledge/references/
├── STANDARDS.md
├── REF-001.accounting-textbook.md
├── REF-002.ifrs-standards.md
└── ...
```

---

## 5. Naming Convention

| Element | Convention | Example |
|---------|-----------|---------|
| Files | `REF-{NUM}.{kebab-name}.md` | `REF-001.accounting-textbook.md` |
| IDs | `REF-{NUM}` | `REF-001` |
