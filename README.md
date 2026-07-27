<div align="center">

# 🌟 Lumora ERP

### AI-First Enterprise Resource Planning System

> **Build the system. Let the AI build with you.**

![Version](https://img.shields.io/badge/version-0.0.1--bootstrap-blueviolet?style=flat-square)
![Runtime](https://img.shields.io/badge/runtime-Bun-%23FBF0DF?style=flat-square&logo=bun)
![Monorepo](https://img.shields.io/badge/monorepo-Turborepo-%23EF4444?style=flat-square&logo=turborepo)
![Frontend](https://img.shields.io/badge/frontend-Svelte%205-%23FF3E00?style=flat-square&logo=svelte)
![Backend](https://img.shields.io/badge/backend-Encore.ts-%234B32C3?style=flat-square)
![Database](https://img.shields.io/badge/database-Neon%20PostgreSQL-%234169E1?style=flat-square&logo=postgresql)
![ORM](https://img.shields.io/badge/orm-Drizzle-%23C5F74F?style=flat-square)
![Auth](https://img.shields.io/badge/auth-Better%20Auth-%23000000?style=flat-square)
![UI](https://img.shields.io/badge/ui-shadcn--svelte-%23000000?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-success?style=flat-square)
![Status](https://img.shields.io/badge/status-Bootstrap-yellow?style=flat-square)

---

**Lumora** is an AI-first ERP system for small-to-medium enterprises, built with a **Development Operating System** approach. The repository is the **Single Source of Truth (SSOT)** — every business rule, architectural decision, and line of generated code originates here.

> ⚡ **This repository builds the ERP. The ERP does not exist yet.**

---

</div>

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [The Knowledge Repository](#the-knowledge-repository)
- [AI Operating System](#ai-operating-system)
- [Development Phases](#development-phases)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing & Quality](#testing--quality)
- [Contributing](#contributing)
- [License](#license)

---

## 🏗️ Architecture Overview

The system follows a **Clean Architecture / Domain-Driven Design** approach, organized as a Turborepo monorepo with strict dependency boundaries.

```mermaid
graph TB
    subgraph Frontend["🧩 Frontend (SvelteKit)"]
        WEB["apps/web"]
        UI["packages/ui<br/>shadcn-svelte + Bits UI"]
    end

    subgraph Backend["⚙️ Backend (Encore.ts)"]
        API["services/backend<br/>REST API"]
        AUTH["packages/auth<br/>Better Auth"]
    end

    subgraph Data["🗄️ Data Layer"]
        DB[("Neon PostgreSQL")]
        ORM["packages/database<br/>Drizzle ORM"]
        VAL["packages/validation<br/>Zod Schemas"]
    end

    subgraph Shared["🔗 Shared Layer"]
        CFG["packages/config"]
        SHARED["packages/shared<br/>Types & Utilities"]
    end

    subgraph Knowledge["📚 Knowledge Repository"]
        CONST["knowledge/constitution"]
        ONT["knowledge/ontology"]
        RULES["knowledge/rules"]
        WF["knowledge/workflows"]
        GLOSS["knowledge/glossary"]
    end

    subgraph AI["🤖 AI Operating System"]
        AGENTS[".ai/agents"]
        PROMPTS[".ai/prompts"]
        PLAYBOOKS[".ai/playbooks"]
        MEMORY[".ai/memory"]
    end

    WEB --> UI
    WEB --> AUTH
    WEB --> API
    API --> ORM
    API --> AUTH
    API --> VAL
    API --> SHARED
    ORM --> DB
    UI --> SHARED
    UI --> CFG
    AUTH --> ORM
    AUTH --> VAL

    CONST --> ONT
    ONT --> RULES
    RULES --> WF
    ONT --> GLOSS

    AGENTS --> PROMPTS
    AGENTS --> PLAYBOOKS
    PROMPTS --> MEMORY

    PLAYBOOKS -.-> API
    PLAYBOOKS -.-> WEB
```

---

## 📁 Repository Structure

```mermaid
mindmap
  root((lumora-erp))
    apps
      web[SvelteKit Frontend]
    services
      backend[Encore.ts API]
    packages
      ui[shadcn-svelte Components]
      database[Drizzle ORM & Migrations]
      auth[Better Auth Config]
      shared[Common Types & Utils]
      config[Shared Config]
      validation[Zod Schemas]
    knowledge[📚 Knowledge Repository — SSOT]
      constitution[Permanent Domain Rules]
      ontology[Domain Concepts & Relationships]
      rules[Extracted Business Rules]
      workflows[Process Definitions]
      graph[Knowledge Graph]
      glossary[Ubiquitous Language]
      templates[Artifact Templates]
      reports[Report Definitions]
      examples[Reference Impls]
      references[External References]
    .ai[🤖 AI Operating System]
      agents[Specialized AI Workers]
      prompts[Reusable Prompt Lib]
      playbooks[Workflow Playbooks]
      commands[Custom Commands]
      memory[Persistent AI Memory]
      contexts[Context Definitions]
      checklists[Quality Gates]
      system[System Prompts]
    engineering[📐 Engineering Docs]
      architecture[DDD & Clean Architecture]
      frontend[Svelte 5 Standards]
      backend[Encore.ts Patterns]
      database[Drizzle ORM & SQL]
      api[REST Conventions]
      testing[Vitest & Playwright]
      deployment[Docker & CI/CD]
      security[Auth & OWASP]
      performance[Optimization]
      observability[Logging & Tracing]
    tooling[🔧 Build & Dev Tooling]
    docs[📖 General Documentation]
    .github[GitHub Config]
```

### Directory Legend

| Path | Purpose |
|------|---------|
| `apps/web/` | SvelteKit frontend application |
| `services/backend/` | Encore.ts API service |
| `packages/*/` | Shared libraries (UI, database, auth, types, config, validation) |
| `knowledge/` | **Single Source of Truth** — all business knowledge lives here |
| `.ai/` | **AI Operating System** — agents, prompts, playbooks, memory |
| `engineering/` | Engineering standards and best practices |
| `tooling/` | Build and development tooling |
| `docs/` | General documentation |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🧠 **Runtime** | [Bun](https://bun.sh) | Fast JavaScript runtime & package manager |
| 📦 **Monorepo** | [Turborepo](https://turbo.build/repo) | Task orchestration & caching |
| 🎨 **Frontend** | [Svelte 5](https://svelte.dev) + [SvelteKit](https://kit.svelte.dev) | Reactive UI framework |
| ⚙️ **Backend** | [Encore.ts](https://encore.dev) | Type-safe backend framework |
| 🗄️ **Database** | [Neon PostgreSQL](https://neon.tech) | Serverless PostgreSQL |
| 🔄 **ORM** | [Drizzle ORM](https://orm.drizzle.team) | Type-safe SQL ORM |
| 🔐 **Auth** | [Better Auth](https://better-auth.com) | Authentication & authorization |
| 🎯 **UI** | [Tailwind CSS v4](https://tailwindcss.com) + [Bits UI](https://bits-ui.com) + [shadcn-svelte](https://shadcn-svelte.com) | Component library |
| 📁 **Storage** | [Cloudflare R2](https://cloudflare.com/r2) | Object storage |
| ✉️ **Email** | [Resend](https://resend.com) | Email service |
| 💳 **Payments** | [Stripe](https://stripe.com) | Payment processing |
| 🧪 **Testing** | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) | Unit & E2E testing |
| 🐳 **Containers** | [Docker](https://docker.com) | Containerization |
| 🔄 **CI/CD** | [GitHub Actions](https://github.com/features/actions) | Continuous integration |

---

## 📚 The Knowledge Repository

The `knowledge/` directory is the **Single Source of Truth**. Every business rule, workflow, and domain concept is defined here first — code is derived from it.

```mermaid
flowchart LR
    CONST[Constitution] --> ONT[Ontology]
    ONT --> RULES[Business Rules]
    ONT --> GLOSS[Glossary]
    RULES --> WF[Workflows]
    WF --> TEMPLATES[Templates]
    TEMPLATES --> CODE[Generated Code]

    style CONST fill:#d4a5f5,color:#000
    style CODE fill:#85e085,color:#000
```

### Knowledge Pipeline

| Step | Artifact | Description |
|------|----------|-------------|
| 1️⃣ | **Constitution** | Permanent, immutable domain rules (`knowledge/constitution/`) |
| 2️⃣ | **Ontology** | Formal domain concepts, relationships, and attributes (`knowledge/ontology/`) |
| 3️⃣ | **Glossary** | Ubiquitous language — every term defined precisely (`knowledge/glossary/`) |
| 4️⃣ | **Rules** | Extracted business rules from ontology (`knowledge/rules/`) |
| 5️⃣ | **Workflows** | Step-by-step process definitions with validation (`knowledge/workflows/`) |
| 6️⃣ | **Templates** | Reusable artifact templates for code generation (`knowledge/templates/`) |
| 7️⃣ | **Graph** | Machine-readable knowledge graph (`knowledge/graph/`) |

---

## 🤖 AI Operating System

The `.ai/` directory enables AI-assisted development. It transforms knowledge into working code through specialized agents and structured workflows.

```mermaid
graph LR
    subgraph INPUT["📥 Input"]
        KNOW[Knowledge Repository]
        TASK[User Task]
    end

    subgraph ORCH["🧠 AI Operating System"]
        direction TB
        AGENTS[Specialized Agents]
        PROMPTS[Prompt Library]
        PLAYBOOKS[Workflow Playbooks]
        MEMORY[Persistent Memory]
        CHECK[Quality Checklists]
    end

    subgraph OUTPUT["📤 Output"]
        CODE[Generated Code]
        DOCS[Documentation]
        TESTS[Tests]
        REVIEWS[Code Reviews]
    end

    KNOW --> AGENTS
    TASK --> AGENTS
    AGENTS --> PROMPTS
    AGENTS --> PLAYBOOKS
    AGENTS --> MEMORY
    AGENTS --> CHECK
    PROMPTS --> CODE
    PLAYBOOKS --> CODE
    CHECK --> CODE
    CHECK --> TESTS
    CHECK --> DOCS
    CODE --> REVIEWS
```

### AI Agents

| Agent | Role |
|-------|------|
| 🏛️ **Domain Agent** | Ontologist — maintains domain models and business rules |
| 🏗️ **Architect Agent** | Designs system architecture and enforces patterns |
| 💻 **Code Agent** | Implements features following engineering standards |
| 📝 **Doc Agent** | Creates and maintains documentation |
| 🧪 **Test Agent** | Writes and maintains tests |
| 👁️ **Review Agent** | Code review and quality enforcement |
| ✅ **QA Agent** | Validates against quality gates |

### Development Flow with AI

```mermaid
sequenceDiagram
    participant Dev as 👨‍💻 Developer
    participant AI as 🤖 AI System
    participant KR as 📚 Knowledge Repo
    participant Code as 💻 Generated Code
    participant QA as ✅ Quality Gates

    Dev->>AI: Define task / requirement
    AI->>KR: Read relevant knowledge
    KR-->>AI: Domain rules, ontology, workflows
    AI->>AI: Select agent & prompt
    AI->>Code: Generate implementation
    Code-->>AI: Generated output
    AI->>QA: Validate against checklists
    QA-->>AI: Validation results
    AI->>Dev: Present result for review
    Dev->>AI: Feedback / corrections
    AI->>Code: Refine & finalize
```

---

## 🎯 Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Repository Bootstrap |
| 2 | ✅ Complete | Knowledge Repository Standards |
| 3 | ✅ Complete | AI Operating System |
| 4 | ✅ Complete | Engineering Documentation |
| 5 | ✅ Complete | Package Documentation |
| 6 | ✅ Complete | Prompt Library |
| 7 | ✅ Complete | Templates |
| 8 | ✅ Complete | Quality Gates & Validation |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.14
- [Docker](https://docker.com) (for local database)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lumora.git
cd lumora

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Start database (Docker)
docker compose up -d

# Run database migrations
bun db:migrate

# Seed development data
bun db:seed
```

### Development

```bash
# Start all services in dev mode
bun dev

# Start only the frontend
cd apps/web && bun dev

# Start only the backend
cd services/backend && bun dev
```

### Scripts Reference

| Script | Description |
|--------|-------------|
| `bun install` | Install all dependencies |
| `bun dev` | Start all services in dev mode |
| `bun build` | Build all packages |
| `bun test` | Run all tests |
| `bun test:unit` | Run unit tests only |
| `bun test:e2e` | Run end-to-end tests |
| `bun lint` | Lint all packages |
| `bun format` | Format code with Biome |
| `bun typecheck` | TypeScript type checking |
| `bun check` | Biome lint + format check |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:migrate` | Apply database migrations |
| `bun db:seed` | Seed development data |
| `bun validate` | Run validation checks |
| `bun clean` | Clean all build outputs |

---

## 🔄 Development Workflow

```mermaid
gitGraph
    options
        {"gitGraph":
            {"showBranches": true, "showCommitLabel": true, "mainBranchName": "main"}
        }
    end
    commit tag: "v0.0.1"
    branch feature/accounting-module
    commit id: "Define ontology"
    commit id: "Add business rules"
    commit id: "Generate workflows"
    commit id: "Implement API"
    commit id: "Build UI components"
    commit id: "Add tests"
    branch review/accounting-module
    commit id: "Code review"
    checkout feature/accounting-module
    merge review/accounting-module
    checkout main
    merge feature/accounting-module tag: "v0.1.0"
```

### Monorepo Task Pipeline

```mermaid
graph LR
    subgraph CI["⚡ CI Pipeline"]
        INSTALL[Install Dependencies] --> LINT[Biome Lint]
        INSTALL --> TYPECHECK[TypeScript Check]
        LINT --> TEST[Vitest Unit Tests]
        TYPECHECK --> TEST
        TEST --> BUILD[Turborepo Build]
        BUILD --> E2E[Playwright E2E]
        BUILD --> VALIDATE[Validation Gate]
    end
```

---

## 🧪 Testing & Quality

| Test Type | Tool | Scope |
|-----------|------|-------|
| Unit | Vitest | Individual functions & components |
| Integration | Vitest | API endpoints & database queries |
| E2E | Playwright | Full user flows |
| Coverage | Vitest + Istanbul | ≥80% coverage target |
| Linting | Biome | Code style & formatting |
| Type Check | TypeScript | Type safety across the monorepo |

---

## 🤝 Contributing

1. **Read the Constitution** — Start with `knowledge/constitution/` to understand the domain and engineering principles.
2. **Review Engineering Standards** — Each discipline has standards in `engineering/`.
3. **Reference the Glossary** — Use consistent terminology from `knowledge/glossary/`.
4. **Use Templates** — Create new artifacts using `knowledge/templates/`.
5. **Follow the Workflow** — All changes require a PR with review.

```mermaid
flowchart TD
    START([Start]) --> READ[Read Knowledge Base]
    READ --> PLAN[Plan Changes]
    PLAN --> IMPL[Implement with AI Assist]
    IMPL --> VAL[Run Validation]
    VAL --> PASS{Validates?}
    PASS -->|Yes| PR[Open Pull Request]
    PASS -->|No| FIX[Fix Issues]
    FIX --> IMPL
    PR --> REVIEW[Code Review]
    REVIEW --> APPROVED{Approved?}
    APPROVED -->|Yes| MERGE[Merge to Main]
    APPROVED -->|No| REVISE[Address Feedback]
    REVISE --> IMPL
    MERGE --> DONE([✅ Done])
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

*Built with precision for a 20-year lifespan.*

[⬆ Back to top](#-lumora-erp)

</div>
