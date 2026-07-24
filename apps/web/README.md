# Web Application

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** SvelteKit + Svelte 5

---

## Purpose

The main web application for the Lumora ERP system. Built with SvelteKit and Svelte 5, providing the user interface for all ERP features.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| SvelteKit | Application framework |
| Svelte 5 | UI framework (runes) |
| Tailwind CSS v4 | Styling |
| Bits UI | Headless components |
| shadcn-svelte | UI components |
| Better Auth | Authentication |
| Biome | Linting/formatting |
| Vitest | Unit tests |
| Playwright | E2E tests |

---

## Structure

```
apps/web/src/
├── routes/                    # SvelteKit routes
│   ├── +layout.svelte         # Root layout
│   ├── +page.svelte           # Home page
│   ├── (app)/                 # Authenticated routes
│   │   ├── +layout.svelte     # App layout
│   │   ├── dashboard/
│   │   ├── financial/
│   │   ├── inventory/
│   │   ├── sales/
│   │   └── settings/
│   └── (auth)/                # Unauthenticated routes
│       ├── login/
│       └── register/
├── lib/
│   ├── components/
│   │   ├── ui/                # shadcn-svelte components
│   │   ├── layout/            # Layout components
│   │   └── features/          # Feature components
│   ├── utils/                 # Utility functions
│   ├── types/                 # TypeScript types
│   └── server/                # Server-only code
├── hooks.server.ts            # Server hooks
└── app.html                   # HTML template
```

---

## Development

```bash
# Start dev server
bun dev

# Build for production
bun build

# Run E2E tests
bun test:e2e
```

---

## Key Features

- Dashboard with KPIs
- Financial management (invoices, payments, accounts)
- Inventory tracking
- Sales order management
- User settings and preferences
