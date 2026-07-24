# Web Application AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This is the SvelteKit web application for Lumora ERP. It consumes shared packages and communicates with the backend service.

---

## Key Dependencies

| Package | Import | Purpose |
|---------|--------|---------|
| `@lumora/ui` | `$lib/components/ui` | UI components |
| `@lumora/shared` | `$lib/shared` | Shared types/utils |
| `@lumora/validation` | `$lib/validation` | Zod schemas |
| `@lumora/auth` | `$lib/auth` | Auth client |

---

## AI Rules

1. **Always use Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$props`.
2. **Never use Svelte 4 syntax** — No `$:`, no `on:click`.
3. **Always use TypeScript** — No JavaScript files.
4. **Always handle loading/error states** — Show spinners and error messages.
5. **Always validate user input** — Use Zod schemas.
6. **Always use semantic HTML** — `<button>`, `<nav>`, `<main>`.
7. **Always add ARIA labels** — For accessibility.

---

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `InvoiceCard.svelte` |
| Routes | kebab-case | `invoice-detail/` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Invoice.ts` |

---

## Component Template

```svelte
<script>
  /** @type {{ title: string }} */
  let { title } = $props();
  
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<div>
  <h1>{title}</h1>
  <p>Count: {count}, Doubled: {doubled}</p>
</div>
```

---

## Validation Checklist

- [ ] Biome check passes
- [ ] No `$:` or `on:click` syntax
- [ ] All props are typed
- [ ] Loading states present
- [ ] Error states present
- [ ] ARIA labels added
