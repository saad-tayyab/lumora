# AI Operating System

> **Status:** Active  
> **Version:** 1.0.0  
> **Owner:** AI Systems Engineer

---

## Purpose

The `.ai/` directory is the AI operating system for the Lumora ERP development process. It defines how AI agents operate, what prompts they use, how they maintain memory, and how they ensure quality.

---

## Directory Structure

| Directory | Purpose | Owner |
|-----------|---------|-------|
| `agents/` | Agent definitions and configurations | AI Systems Engineer |
| `prompts/` | Reusable prompt library | AI Systems Engineer |
| `playbooks/` | Step-by-step workflow guides | Knowledge Engineer |
| `commands/` | Custom CLI commands for AI workflows | DevOps Engineer |
| `memory/` | Persistent AI memory and context | AI Systems Engineer |
| `contexts/` | Context definitions for different tasks | AI Systems Engineer |
| `checklists/` | Quality gate checklists | QA Agent |
| `system/` | System-level prompts and configurations | AI Systems Engineer |

---

## How It Works

1. **Agent** receives a task from the user
2. **Agent** loads relevant **context** and **prompts**
3. **Agent** references **knowledge repository** for business rules
4. **Agent** produces output following **templates**
5. **Agent** runs **checklists** to validate output
6. **Agent** stores learnings in **memory**

---

## Naming Conventions

| Artifact | Format | Example |
|----------|--------|---------|
| Agent | `{role}-agent.md` | `architect-agent.md` |
| Prompt | `PR-{NUMBER}-{name}.md` | `PR-001-bootstrap.md` |
| Playbook | `PB-{name}.md` | `PB-pdf-ingestion.md` |
| Command | `{name}.sh` | `ingest.sh` |
| Memory | `{type}-{date}.md` | `shortterm-2026-07-24.md` |
| Context | `{task}-context.md` | `code-generation-context.md` |
| Checklist | `{gate}-checklist.md` | `pre-merge-checklist.md` |

---

## Quality Gates

Every AI output must pass:

1. No business rules invented
2. All IDs follow naming conventions
3. Cross-references are valid
4. Templates followed
5. Terminology matches glossary

---

*This directory is the nervous system of the AI development process.*
