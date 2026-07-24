# Auth Package AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This package handles authentication and authorization for Lumora ERP using Better Auth.

---

## AI Rules

1. **Always use Better Auth** — No custom auth implementations.
2. **Always validate sessions** — Check on every request.
3. **Always use RBAC** — Role-based access control.
4. **Never store passwords** — Better Auth handles this.
5. **Never skip auth checks** — Every endpoint must be protected.

---

## Validation Checklist

- [ ] Biome check passes
- [ ] Better Auth used
- [ ] Sessions validated
- [ ] RBAC implemented
- [ ] No passwords stored
