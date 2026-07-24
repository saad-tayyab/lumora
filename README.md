# Lumora ERP - AI-First Development Operating System

> **Version:** 0.0.1  
> **Status:** Bootstrap  
> **Last Updated:** 2026-07-24

---

## Overview

Lumora is an AI-first ERP system built with a development operating system approach. The repository is the **Single Source of Truth (SSOT)** for all business knowledge, engineering decisions, and generated code.

**This repository builds the ERP. The ERP does not exist yet.**

---

## Repository Structure

```
.
├── apps/                    # Application packages
│   └── web/                 # SvelteKit frontend
├── services/                # Backend services
│   └── backend/             # Encore.ts API service
├── packages/                # Shared packages
│   ├── ui/                  # Svelte UI components
│   ├── database/            # Drizzle ORM schemas & migrations
│   ├── auth/                # Better Auth configuration
│   ├── shared/              # Common types & utilities
│   ├── config/              # Shared configuration
│   └── validation/          # Zod schemas
├── knowledge/               # Knowledge Repository (SSOT)
│   ├── constitution/        # DOMAIN.md, ENGINEERING.md, AI.md
│   ├── ontology/            # Domain ontology definitions
│   ├── rules/               # Business rules
│   ├── workflows/           # Process workflows
│   ├── graph/               # Knowledge graph
│   ├── reports/             # Report definitions
│   ├── glossary/            # Ubiquitous language
│   ├── templates/           # Reusable templates
│   ├── examples/            # Reference implementations
│   ├── references/          # External references
│   └── manifests/           # Metadata catalogs
├── .ai/                     # AI operating system
│   ├── agents/              # Agent definitions
│   ├── prompts/             # Prompt library
│   ├── playbooks/           # Workflow playbooks
│   ├── commands/            # Custom commands
│   ├── memory/              # AI memory system
│   ├── contexts/            # Context definitions
│   ├── checklists/          # Quality checklists
│   └── system/              # System prompts
├── tooling/                 # Build & dev tooling
├── engineering/             # Engineering documentation
│   ├── frontend/            # Frontend standards
│   ├── backend/             # Backend standards
│   ├── database/            # Database standards
│   ├── api/                 # API standards
│   ├── testing/             # Testing standards
│   ├── deployment/          # Deployment standards
│   ├── security/            # Security standards
│   ├── architecture/        # Architecture standards
│   ├── performance/         # Performance standards
│   └── observability/       # Observability standards
├── docs/                    # General documentation
├── .github/                 # GitHub configuration
│   ├── workflows/           # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   └── PULL_REQUEST_TEMPLATE/ # PR templates
├── package.json             # Root package.json
├── turbo.json               # Turborepo config
├── tsconfig.json            # Root TypeScript config
└── .gitignore               # Git ignore rules
```

---

## Getting Started

```bash
# Install dependencies
bun install

# Start development
bun dev

# Run tests
bun test

# Type check
bun typecheck

# Lint
bun lint
```

---

## Knowledge Repository

The `knowledge/` directory is the **Single Source of Truth**. Everything originates here:

1. **Constitution** → Defines permanent rules
2. **Ontology** → Defines domain concepts and relationships
3. **Rules** → Extracted business rules
4. **Workflows** → Process definitions
5. **Graph** → Knowledge graph (Mermaid, YAML, JSON)
6. **Templates** → Reusable artifact templates
7. **Glossary** → Ubiquitous language

---

## AI System

The `.ai/` directory enables AI-assisted development:

1. **Agents** → Specialized AI workers
2. **Prompts** → Reusable prompt library
3. **Playbooks** → Step-by-step workflows
4. **Memory** → Persistent AI knowledge
5. **Checklists** → Quality gate enforcement

---

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Repository Bootstrap |
| 2 | ✅ | Knowledge Repository Standards |
| 3 | ⏳ | AI Operating System |
| 4 | ⏳ | Engineering Documentation |
| 5 | ⏳ | Package Documentation |
| 6 | ✅ | Prompt Library |
| 7 | ✅ | Templates |
| 8 | ⏳ | Quality Gates & Validation |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Monorepo | Turborepo |
| Frontend | Svelte 5 + SvelteKit |
| Backend | Encore.ts |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM v1 |
| Auth | Better Auth |
| UI | Tailwind CSS v4 + Bits UI + shadcn-svelte |
| Storage | Cloudflare R2 |
| Email | Resend |
| Payments | Stripe |
| Testing | Vitest + Playwright |
| Containers | Docker |
| CI/CD | GitHub Actions |

---

## Contributing

1. Read the constitutions in `knowledge/constitution/`
2. Follow the engineering standards in `engineering/`
3. Reference the glossary for terminology
4. Use templates for new artifacts
5. All changes require PR review

---

*Built with precision for a 20-year lifespan.*
