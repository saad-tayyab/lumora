# Validate Command

> **Command ID:** CMD-002  
> **Purpose:** Validate the knowledge repository consistency  
> **Version:** 1.0.0

---

## Usage

```bash
bun .ai/commands/validate.sh
```

## What It Does

1. Regenerates all manifests
2. Runs orphan detection
3. Runs link validation
4. Runs duplicate detection
5. Validates naming conventions
6. Validates YAML front matter
7. Reports results

## Output

- Updated `knowledge/manifests/orphans.yml`
- Updated `knowledge/manifests/links.yml`
- Validation report

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All validations passed |
| 1 | Validation errors found |
| 2 | Critical errors (orphans, broken links) |
