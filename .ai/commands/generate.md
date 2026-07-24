# Generate Command

> **Command ID:** CMD-003  
> **Purpose:** Generate code from knowledge repository artifacts  
> **Version:** 1.0.0

---

## Usage

```bash
bun .ai/commands/generate.sh <feature-name> <context>
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `feature-name` | yes | Name of the feature to generate |
| `context` | yes | Target bounded context |

## Example

```bash
bun .ai/commands/generate.sh invoice-creation BC-AR
```

## What It Does

1. Loads feature specification
2. Looks up relevant concepts and rules
3. Loads Code Generation Context
4. Executes Code Generation Playbook
5. Runs Biome check
6. Generates tests
7. Updates documentation
8. Reports results

## Output

- Backend service code
- Frontend components
- Database schemas
- API routes
- Unit tests
- Documentation updates
