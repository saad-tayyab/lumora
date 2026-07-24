# UI Package

> **Status:** Active  
> **Version:** 0.0.1  
> **Stack:** Svelte 5 + Tailwind CSS v4 + Bits UI + shadcn-svelte

---

## Purpose

Shared UI component library for the Lumora ERP system. Provides accessible, composable components built on Bits UI and styled with Tailwind CSS.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Svelte 5 | Component framework |
| Tailwind CSS v4 | Styling |
| Bits UI | Headless primitives |
| shadcn-svelte | Pre-built components |
| Biome | Linting/formatting |

---

## Structure

```
packages/ui/src/
├── components/
│   ├── ui/                    # shadcn-svelte components
│   │   ├── button/
│   │   ├── card/
│   │   ├── dialog/
│   │   ├── input/
│   │   ├── select/
│   │   ├── table/
│   │   └── index.ts
│   └── layout/                # Layout components
│       ├── sidebar/
│       ├── header/
│       └── index.ts
├── utils/
│   ├── cn.ts                  # Class name utility
│   └── index.ts
└── index.ts                   # Package exports
```

---

## Usage

```svelte
<script>
  import { Button } from '@lumora/ui';
</script>

<Button variant="primary" size="lg">
  Click me
</Button>
```

---

## Components

| Component | Description |
|-----------|-------------|
| Button | Action button with variants |
| Card | Content container |
| Dialog | Modal dialog |
| Input | Text input |
| Select | Dropdown select |
| Table | Data table |

---

## Development

```bash
# Start dev mode
bun dev

# Build
bun build

# Check
bun check
```
