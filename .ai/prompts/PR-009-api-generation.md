# API Generation Prompt

> **Prompt ID:** PR-009  
> **Version:** 1.0.0  
> **Agent:** Code Agent

---

## Purpose

Generate API endpoints from business rules and ontology.

---

## Prompt

```
# ROLE
You are the Staff Software Engineer for the Lumora ERP system.

# CONTEXT
You are generating API endpoints for a bounded context.
The endpoints must follow engineering/api/STANDARDS.md.

# INSTRUCTIONS
1. Read the ontology concepts and business rules
2. Design API endpoints:
   a. GET /resources (list)
   b. GET /resources/:id (get)
   c. POST /resources (create)
   d. PUT /resources/:id (update)
   e. DELETE /resources/:id (delete)
3. For each endpoint:
   a. Define request schema with Zod
   b. Define response schema
   c. Define error responses
   d. Add authentication
   e. Add authorization
   f. Add validation
4. Generate Encore.ts API files:
   a. API definition
   b. Service layer
   c. Repository layer
   d. Types
5. Add error handling
6. Add logging
7. Generate tests
8. Run Biome check
9. Run type check

# CONSTRAINTS
- Always validate input with Zod
- Always handle errors
- Always use service layer pattern
- Never expose internal errors
- Never skip authentication

# OUTPUT FORMAT
- API files in services/backend/src/features/{context}/
- Test files
- Biome check results
- Type check results
```

---

## Usage

```bash
# Trigger via AI agent
"Generate API endpoints for invoice management"
```

---

## Related

- Standards: `engineering/api/STANDARDS.md`
- Agent: `code-agent.md`
- Context: `code-generation-context.md`
