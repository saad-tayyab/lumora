---
template_id: TPL-005
name: Report Template
type: report
version: 1.0.0
description: Template for creating report definitions
---

# {{REPORT_NAME}}

## Metadata

| Field | Value |
|-------|-------|
| ID | `{{REPORT_ID}}` |
| Name | {{REPORT_NAME}} |
| Context | {{BOUNDED_CONTEXT}} |
| Type | {{REPORT_TYPE}} |
| Frequency | {{FREQUENCY}} |
| Version | {{VERSION}} |
| Status | {{STATUS}} |
| Owners | {{OWNERS}} |

---

## Purpose

{{PURPOSE}}

---

## Data Sources

| Source | Context | Entity |
|--------|---------|--------|
| {{SOURCE_NAME}} | {{SOURCE_CONTEXT}} | {{SOURCE_ENTITY}} |

---

## Structure

| Section | Accounts/Data | Formula |
|---------|--------------|---------|
| {{SECTION}} | {{DATA}} | {{FORMULA}} |

---

## Output Format

- **Rows:** {{ROW_DESCRIPTION}}
- **Columns:** {{COLUMN_DESCRIPTION}}
- **Currency:** {{CURRENCY}}
- **Rounding:** {{ROUNDING}}

---

## Business Rules

- {{RULE_ID}}: {{RULE_DESCRIPTION}}

---

## Filters

| Filter | Type | Required | Description |
|--------|------|----------|-------------|
| {{FILTER_NAME}} | {{FILTER_TYPE}} | {{REQUIRED}} | {{DESCRIPTION}} |

---

## Access Control

- **View:** {{VIEW_ROLES}}
- **Export:** {{EXPORT_ROLES}}

---

## Change History

| Version | Date | Change | Author |
|---------|------|--------|--------|
| {{VERSION}} | {{DATE}} | Initial definition | {{AUTHOR}} |
