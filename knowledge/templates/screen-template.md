---
template_id: TPL-009
name: Screen Template
type: screen
version: 1.0.0
description: Template for creating screen/page definitions
---

# {{SCREEN_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| Name | {{SCREEN_NAME}} |
| Route | {{ROUTE}} |
| Context | {{BOUNDED_CONTEXT}} |
| Version | {{VERSION}} |

---

## Purpose

{{PURPOSE}}

---

## User Stories

- As a {{USER_TYPE}}, I want to {{ACTION}} so that {{BENEFIT}}.

---

## Layout

```
+------------------------------------------+
| Header                                    |
+------------------------------------------+
| Sidebar | Main Content                    |
|         |                                 |
|         | [Filters]                       |
|         |                                 |
|         | [Data Table / Form / Card]      |
|         |                                 |
|         | [Pagination]                    |
+------------------------------------------+
| Footer                                    |
+------------------------------------------+
```

---

## Components

| Component | Type | Description |
|-----------|------|-------------|
| {{COMPONENT_NAME}} | {{COMPONENT_TYPE}} | {{DESCRIPTION}} |

---

## Data Requirements

| Data | Source | Endpoint | Description |
|------|--------|----------|-------------|
| {{DATA_NAME}} | {{SOURCE}} | {{ENDPOINT}} | {{DESCRIPTION}} |

---

## Actions

| Action | Trigger | Endpoint | Description |
|--------|---------|----------|-------------|
| {{ACTION_NAME}} | {{TRIGGER}} | {{ENDPOINT}} | {{DESCRIPTION}} |

---

## States

| State | Description |
|-------|-------------|
| Loading | {{LOADING_STATE}} |
| Empty | {{EMPTY_STATE}} |
| Error | {{ERROR_STATE}} |
| Success | {{SUCCESS_STATE}} |

---

## Accessibility

- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation supported
- [ ] Screen reader tested
- [ ] Color contrast meets WCAG AA

---

## Related

- API: [{{API_NAME}}]({{API_PATH}})
- Components: [{{COMPONENT_LIST}}]

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
