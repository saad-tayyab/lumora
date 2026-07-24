# Shared Package AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This package contains shared types, utilities, and constants used across all packages.

---

## AI Rules

1. **Always use TypeScript** — No JavaScript.
2. **Always use branded types** — For IDs and Money.
3. **Always export from index.ts** — Barrel exports.
4. **Never depend on other packages** — This is a leaf package.
5. **Never include business logic** — Only types and utilities.

---

## Validation Checklist

- [ ] Biome check passes
- [ ] TypeScript strict mode
- [ ] Branded types used
- [ ] No business logic
- [ ] No external dependencies
