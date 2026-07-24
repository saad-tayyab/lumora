# Code Generation Playbook

> **Playbook ID:** PB-003  
> **Version:** 1.0.0  
> **Owner:** AI Systems Engineer

---

## Purpose

Step-by-step guide for generating production-quality code from knowledge repository artifacts.

---

## Prerequisites

- Knowledge repository populated with concepts and rules
- Engineering standards defined
- Existing codebase patterns identified

## Pipeline

```
Feature Spec
  ↓
Concept Lookup
  ↓
Business Rule Lookup
  ↓
API Contract Design
  ↓
Database Schema Generation
  ↓
Backend Service Generation
  ↓
Frontend Component Generation
  ↓
Test Generation
  ↓
Documentation Generation
  ↓
Validation
```

## Steps

### Step 1: Concept Lookup
1. Identify relevant concepts from feature spec
2. Load concept definitions from ontology
3. Identify relationships and constraints
4. Reference bounded context

### Step 2: Business Rule Lookup
1. Identify applicable business rules
2. Load rule definitions
3. Understand invariants and constraints
4. Plan enforcement points

### Step 3: API Contract Design
1. Design endpoints based on concepts
2. Define request/response schemas
3. Add validation rules from business rules
4. Generate OpenAPI spec

### Step 4: Database Schema Generation
1. Map concepts to Drizzle schemas
2. Apply constraints from ontology
3. Generate migration scripts
4. Validate against database standards

### Step 5: Backend Service Generation
1. Generate repository layer
2. Generate service layer
3. Generate API handlers
4. Add error handling
5. Add validation

### Step 6: Frontend Component Generation
1. Generate Svelte components
2. Generate form validation
3. Generate API client
4. Add loading states
5. Add error states

### Step 7: Test Generation
1. Generate unit tests for services
2. Generate integration tests for APIs
3. Generate E2E tests for critical flows
4. Validate coverage

### Step 8: Documentation Generation
1. Update README.md
2. Update AI.md
3. Generate API docs
4. Update changelog

## Validation
- [ ] All generated code passes Biome check
- [ ] All tests pass
- [ ] All business rules are enforced
- [ ] All concepts are referenced
- [ ] Documentation is updated
