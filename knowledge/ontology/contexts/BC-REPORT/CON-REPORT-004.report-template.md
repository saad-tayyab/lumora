---
id: CON-REPORT-004
name: ReportTemplate
context: BC-REPORT
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
  - ERP Architect
tags:
  - reporting
  - templates
---

# ReportTemplate

## Definition

An immutable value object that defines the structure, layout, and parameters of a report. Templates are reused across multiple report instances and determine how data is presented.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| template_id | UUID v7 | yes | Unique identifier |
| name | string(200) | yes | Template display name |
| description | text | no | Template description |
| category | enum | yes | financial, operational, inventory, hr, custom |
| layout_config | json | yes | Layout and formatting configuration |
| parameter_schema | json | yes | JSON Schema defining required parameters |
| output_formats | array | yes | Supported output formats (pdf, csv, xlsx, html) |
| version | integer | yes | Template version number |
| is_system | boolean | yes | Whether this is a system-provided template |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-REPORT-001 (Report) | used-by | 1:N | Template is used by multiple reports |

## Invariants

- Template is immutable once created; new versions create new instances
- Output formats must contain at least one supported format
- Parameter schema must be valid JSON Schema

## Business Rules

- System templates cannot be modified by users
- Custom templates inherit from system templates
- Template versions are increment-only

## References

- [Domain Constitution](../../../constitution/DOMAIN.md)
