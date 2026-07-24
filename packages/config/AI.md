# Config Package AI Guide

> **Purpose:** Guide for AI agents working on this package  
> **Last Updated:** 2026-07-24

---

## Package Overview

This package loads and validates environment variables for all packages.

---

## AI Rules

1. **Always use Zod for validation** — Validate env vars at startup.
2. **Always use `.env.example`** — Document required variables.
3. **Never hardcode secrets** — Always use environment variables.
4. **Never log secrets** — Sanitize before logging.

---

## Validation Checklist

- [ ] Biome check passes
- [ ] Zod validation present
- [ ] All env vars documented
- [ ] No secrets hardcoded
- [ ] No secrets logged
