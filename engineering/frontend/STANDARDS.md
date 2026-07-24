# Frontend Engineering Standards

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-24  
> **Owner:** Frontend Team  
> **Review Cycle:** Quarterly

---

## 1. Purpose

This document defines frontend engineering standards for the Lumora ERP system. All frontend code must comply with these standards.

---

## 2. Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Svelte | 5 | UI framework |
| SvelteKit | Latest | Application framework |
| Tailwind CSS | v4 | Utility-first CSS |
| Bits UI | Latest | Headless UI components |
| shadcn-svelte | Latest | Pre-built UI components |
| Biome | Latest | Linting and formatting |

---

## 3. Svelte 5 Rules

### 3.1 Runes

```svelte
<!-- ALWAYS: Use runes for reactivity -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log(count);
  });
</script>

<!-- NEVER: Use old reactive declarations -->
<!-- BAD:  $: doubled = count * 2; -->
<!-- GOOD: let doubled = $derived(count * 2); -->
```

### 3.2 Component Props

```svelte
<script>
  /** @type {{ title: string, count?: number }} */
  let { title, count = 0 } = $props();
</script>
```

### 3.3 Event Handling

```svelte
<script>
  function handleClick(event) {
    // Handle event
  }
</script>

<button onclick={handleClick}>Click</button>
<!-- NEVER: on:click={handleClick} (Svelte 4 syntax) -->
```

---

## 4. SvelteKit Rules

### 4.1 Route Structure

```
apps/web/src/
├── routes/
│   ├── +layout.svelte           # Root layout
│   ├── +page.svelte             # Home page
│   ├── (app)/                   # Authenticated group
│   │   ├── +layout.svelte       # App layout
│   │   ├── dashboard/
│   │   │   └── +page.svelte
│   │   ├── financial/
│   │   │   ├── +page.svelte
│   │   │   ├── [id]/
│   │   │   │   └── +page.svelte
│   │   │   └── +page.server.ts  # Server load
│   │   └── settings/
│   │       └── +page.svelte
│   ├── (auth)/                  # Unauthenticated group
│   │   ├── login/
│   │   │   └── +page.svelte
│   │   └── register/
│   │       └── +page.svelte
│   └── api/                     # API routes (if needed)
│       └── +server.ts
├── lib/
│   ├── components/
│   │   ├── ui/                  # shadcn-svelte components
│   │   ├── layout/              # Layout components
│   │   └── features/            # Feature-specific components
│   ├── stores/                  # Svelte stores (if needed)
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript types
├── hooks.server.ts              # Server hooks
└── hooks.ts                     # Universal hooks
```

### 4.2 Load Functions

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Always validate params
  // Always check authentication
  // Return serializable data
};
```

### 4.3 Form Actions

```typescript
// +page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    
    // Validate input
    // Process action
    // Return success or fail()
  }
};
```

---

## 5. Tailwind CSS v4 Rules

### 5.1 Class Ordering

```svelte
<!-- ALWAYS: Follow consistent class ordering -->
<div class="
  flex items-center gap-4
  p-4
  bg-white
  rounded-lg
  shadow-sm
  border border-gray-200
">
```

### 5.2 Custom Theme

```css
/* Use CSS custom properties for theming */
:root {
  --color-primary: oklch(0.5 0.2 250);
  --color-secondary: oklch(0.5 0.2 200);
}
```

### 5.3 Responsive Design

```svelte
<!-- ALWAYS: Mobile-first responsive design -->
<div class="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
">
```

---

## 6. Component Organization

### 6.1 Component Structure

```svelte
<script>
  // 1. Imports
  import { Button } from '$lib/components/ui';
  
  // 2. Props
  /** @type {{ title: string, onSave: () => void }} */
  let { title, onSave } = $props();
  
  // 3. State
  let isLoading = $state(false);
  
  // 4. Derived values
  let isDisabled = $derived(isLoading);
  
  // 5. Effects
  $effect(() => {
    // Side effects
  });
  
  // 6. Functions
  async function handleSave() {
    isLoading = true;
    try {
      await onSave();
    } finally {
      isLoading = false;
    }
  }
</script>

<!-- 7. Template -->
<div>
  <h1>{title}</h1>
  <Button onclick={handleSave} disabled={isDisabled}>
    Save
  </Button>
</div>

<!-- 8. Styles (if needed) -->
<style>
  /* Component-specific styles */
</style>
```

### 6.2 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `InvoiceCard.svelte` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Invoice.ts` |
| Stores | camelCase | `auth.ts` |
| Routes | kebab-case | `invoice-detail/` |

---

## 7. Best Practices

1. **Always use TypeScript** — No JavaScript files.
2. **Always type props** — Use JSDoc or TypeScript.
3. **Always handle loading states** — Show spinners/skeletons.
4. **Always handle error states** — Show error messages.
5. **Always use semantic HTML** — `<button>`, `<nav>`, `<main>`.
6. **Always add ARIA labels** — For accessibility.
7. **Always validate user input** — Client-side and server-side.
8. **Never store sensitive data in client state** — Use server load functions.

---

## 8. Anti-patterns

| Anti-pattern | Correct Approach |
|-------------|-----------------|
| Mutating props directly | Use derived values or callbacks |
| Using `any` type | Define proper types |
| Inline functions in templates | Extract to named functions |
| Large components (>200 lines) | Split into smaller components |
| Direct DOM manipulation | Use Svelte reactivity |
| CSS-in-JS | Use Tailwind utility classes |
| Client-side auth checks only | Always validate on server |

---

## 9. Folder Structure

```
apps/web/src/
├── routes/              # SvelteKit routes
├── lib/
│   ├── components/
│   │   ├── ui/          # shadcn-svelte components
│   │   ├── layout/      # Layout components
│   │   └── features/    # Feature components
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── server/          # Server-only code
├── hooks.server.ts      # Server hooks
└── app.html             # HTML template
```
