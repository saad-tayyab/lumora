# Memory System

> **Status:** Active  
> **Version:** 1.0.0  
> **Owner:** AI Systems Engineer

---

## Purpose

Persistent memory for AI agents to maintain context across sessions, track decisions, and learn from past interactions.

---

## Memory Types

| Type | Directory | Purpose | Persistence |
|------|-----------|---------|-------------|
| Working | `working/` | Current task context | Session |
| Short-term | `short-term/` | Recent decisions | Per-run |
| Long-term | `long-term/` | Project conventions | Permanent |
| Episodic | `episodic/` | Past conversations | Indexed |

---

## File Naming

```
{type}/{YYYY-MM-DD}-{topic}.md
```

Example: `long-term/2026-07-24-project-conventions.md`

---

## Memory Entry Format

```yaml
---
id: MEM-{NUM}
type: short-term
topic: "Invoice creation workflow design"
date: 2026-07-24
agent: DOMAIN-001
tags:
  - workflow
  - invoice
  - BC-AR
---

# Invoice Creation Workflow Design

## Context
Designed the invoice creation workflow during Phase 2 knowledge extraction.

## Decisions
- Invoice requires sales order as input
- Journal entries are auto-posted
- Notifications sent via Resend

## References
- WF-AR-001
- BR-001, BR-004
```

---

## Directory Structure

```
.ai/memory/
├── README.md
├── working/
├── short-term/
├── long-term/
│   └── 2026-07-24-project-conventions.md
└── episodic/
```

---

## Rules

1. Memory is append-only — never delete, mark as superseded.
2. Every memory entry must have an ID.
3. Every memory entry must be searchable by tags.
4. Memory cannot contradict constitutions.
5. Stale memory (>90 days) should be archived.
