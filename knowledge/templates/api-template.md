---
template_id: TPL-008
name: API Template
type: api
version: 1.0.0
description: Template for creating API endpoint definitions
---

# {{API_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| Method | {{METHOD}} |
| Path | {{PATH}} |
| Name | {{API_NAME}} |
| Context | {{BOUNDED_CONTEXT}} |
| Version | {{VERSION}} |
| Auth Required | {{AUTH_REQUIRED}} |

---

## Description

{{DESCRIPTION}}

---

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | yes | Bearer token |

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| {{PARAM}} | {{TYPE}} | {{DESCRIPTION}} |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| {{PARAM}} | {{TYPE}} | {{REQUIRED}} | {{DESCRIPTION}} |

### Body

```typescript
interface RequestBody {
  {{FIELDS}}
}
```

### Validation Schema

```typescript
import { z } from 'zod';

const {{SCHEMA_NAME}} = z.object({
  {{ZOD_FIELDS}}
});
```

---

## Response

### Success ({{STATUS_CODE}})

```typescript
interface Response {
  {{FIELDS}}
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| {{STATUS}} | {{ERROR_CODE}} | {{DESCRIPTION}} |

---

## Implementation

- **Handler:** `{{HANDLER_FILE}}`
- **Service:** `{{SERVICE_FILE}}`
- **Repository:** `{{REPO_FILE}}`

---

## Business Rules

- {{RULE_ID}}: {{RULE_DESCRIPTION}}

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
