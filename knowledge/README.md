# Knowledge Repository

> **Status:** Active  
> **Version:** 1.0.0  
> **Owner:** Knowledge Engineer

---

## Purpose

The Knowledge Repository is the **Single Source of Truth (SSOT)** for the entire Lumora ERP system. All business knowledge, domain models, rules, workflows, and architectural decisions are stored here. No business logic or domain knowledge exists outside this directory.

---

## Directory Structure

| Directory | Purpose | Owner |
|-----------|---------|-------|
| `constitution/` | Permanent project rules (DOMAIN, ENGINEERING, AI) | ERP Architect |
| `ontology/` | Domain concepts, relationships, constraints | Product Ontologist |
| `rules/` | Extracted business rules with IDs | CPA + Domain Agent |
| `workflows/` | Process definitions and automations | Knowledge Engineer |
| `graph/` | Knowledge graph (Mermaid, YAML, JSON) | Knowledge Engineer |
| `reports/` | Report definitions and data sources | ERP Architect |
| `glossary/` | Ubiquitous language definitions | Product Ontologist |
| `templates/` | Reusable artifact templates | Documentation Architect |
| `examples/` | Reference implementations | Staff Engineer |
| `references/` | External document references | Technical Writer |
| `manifests/` | Metadata catalogs and indexes | Knowledge Engineer |

---

## Naming Conventions

| Artifact Type | ID Format | Example |
|---------------|-----------|---------|
| Concept | `CON-{CONTEXT}-{NUMBER}` | `CON-FIN-001` |
| Relationship | `REL-{NUMBER}` | `REL-001` |
| Business Rule | `BR-{NUMBER}` | `BR-001` |
| Workflow | `WF-{CONTEXT}-{NUMBER}` | `WF-FIN-001` |
| Decision | `{CONTEXT}-{NUMBER}` | `DOM-001` |
| Glossary Term | `{TermName}` | `Journal Entry` |

---

## Relationships

- **Constitution** → Defines rules → **Rules**
- **Rules** → Reference → **Ontology**
- **Ontology** → Generates → **Graph**
- **Graph** → Validates → **Workflows**
- **Workflows** → Generate → **Code**
- **Templates** → Used by → **All artifacts**

---

## Versioning

- All artifacts use semantic versioning (MAJOR.MINOR.PATCH).
- Breaking changes increment MAJOR.
- New concepts increment MINOR.
- Corrections increment PATCH.
- Version is tracked in YAML front matter.

---

## Usage

1. Never add business rules directly to code.
2. First add to `rules/`, then reference from code.
3. All changes must maintain internal consistency.
4. Run quality gates before merging.

---

*This directory is the brain of the project. Treat it with care.*
