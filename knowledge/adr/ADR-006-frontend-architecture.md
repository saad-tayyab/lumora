---
id: ADR-006
title: Frontend Architecture - Svelte 5 + SvelteKit
status: accepted
date: 2026-07-24
deciders: [Principal Architect, Staff Engineer]
---

# Frontend Architecture - Svelte 5 + SvelteKit

## Status

Accepted

## Context

Lumora ERP needs a frontend framework that provides excellent reactivity, small bundle sizes, strong TypeScript support, and server-side rendering. The framework must support complex forms, real-time data, and accessibility.

## Decision

Use Svelte 5 (5.56.7) with SvelteKit (2.70.1), Tailwind CSS v4 (4.3.3), and shadcn-svelte (1.4.2).

### Route Structure

```
apps/web/src/
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── (app)/
│   │   ├── +layout.svelte
│   │   ├── dashboard/
│   │   │   └── +page.svelte
│   │   ├── financial/
│   │   │   ├── accounts/
│   │   │   ├── journal-entries/
│   │   │   └── +page.svelte
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── purchases/
│   │   ├── hr/
│   │   └── settings/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   └── api/
├── lib/
│   ├── components/
│   │   ├── ui/              # shadcn-svelte components
│   │   ├── layout/          # Layout components
│   │   └── features/        # Feature-specific components
│   ├── utils/
│   ├── types/
│   └── server/
├── hooks.server.ts
└── app.html
```

### Svelte 5 Runes Pattern

```svelte
<script>
  // 1. Props
  let { title, onSave } = $props();

  // 2. State
  let isLoading = $state(false);
  let count = $state(0);

  // 3. Derived
  let doubled = $derived(count * 2);
  let isDisabled = $derived(isLoading);

  // 4. Effects
  $effect(() => {
    console.log(count);
  });

  // 5. Functions
  async function handleSave() {
    isLoading = true;
    try {
      await onSave();
    } finally {
      isLoading = false;
    }
  }
</script>

<div>
  <h1>{title}</h1>
  <button onclick={handleSave} disabled={isDisabled}>Save</button>
</div>
```

### Component Organization

```svelte
<script>
  // 1. Imports
  import { Button } from '$lib/components/ui';

  // 2. Props
  let { title, onSave } = $props();

  // 3. State
  let isLoading = $state(false);

  // 4. Derived
  let isDisabled = $derived(isLoading);

  // 5. Effects
  $effect(() => {});

  // 6. Functions
  async function handleSave() {}
</script>

<!-- 7. Template -->
<div>
  <Button onclick={handleSave} disabled={isDisabled}>Save</Button>
</div>
```

### Tailwind CSS v4 Theming

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.5 0.2 250);
  --color-secondary: oklch(0.5 0.2 200);
}
```

## Consequences

### Positive

- Svelte 5 runes — fine-grained reactivity without virtual DOM
- Tiny bundle sizes — no framework runtime shipped to client
- SvelteKit — SSR, SSG, form actions, load functions
- Tailwind CSS v4 — CSS-first configuration, no JS config
- shadcn-svelte — accessible, customizable components

### Negative

- Svelte 5 ecosystem is still maturing
- Some libraries may not yet support Svelte 5 runes
- Smaller community than React/Vue

### Risks

- Svelte 5 is relatively new — some patterns still evolving
- shadcn-svelte component library may lag behind React version

## Alternatives Considered

### React + Next.js

**Pros:** Largest ecosystem, extensive library support.

**Cons:** Heavier runtime, larger bundles, more complex state management.

### Vue 3 + Nuxt

**Pros:** Good reactivity system, large ecosystem.

**Cons:** Composition API complexity, larger runtime than Svelte.

## Related ADRs

- ADR-001: Technology Stack
- ADR-002: Monorepo Architecture
- ADR-009: API Design

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-24 | Initial definition | Architect Agent |
