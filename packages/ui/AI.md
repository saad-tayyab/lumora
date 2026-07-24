# UI Package AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This is the shared UI component library. It provides accessible, composable components for the web application.

---

## AI Rules

1. **Always use Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$props`.
2. **Always use Bits UI primitives** — Don't build from scratch.
3. **Always use Tailwind for styling** — No CSS modules.
4. **Always make components accessible** — ARIA labels, keyboard navigation.
5. **Always support variants** — Use CVA or similar pattern.
6. **Never hardcode colors** — Use Tailwind theme tokens.

---

## Component Creation

1. Use Bits UI primitive as base
2. Add Tailwind styling
3. Support variants via props
4. Add ARIA attributes
5. Export with proper types

---

## File Template

```svelte
<script>
  /** @type {{ variant?: 'primary' | 'secondary', size?: 'sm' | 'md' | 'lg' }} */
  let { variant = 'primary', size = 'md', children } = $props();
</script>

<button
  class="inline-flex items-center justify-center rounded-md {variants[variant]} {sizes[size]}"
  {...$$restProps}
>
  {@render children?.()}
</button>
```

---

## Validation Checklist

- [ ] Biome check passes
- [ ] Svelte 5 runes used
- [ ] Bits UI primitive used
- [ ] Tailwind classes used
- [ ] ARIA attributes present
- [ ] Variants supported
- [ ] Types exported
