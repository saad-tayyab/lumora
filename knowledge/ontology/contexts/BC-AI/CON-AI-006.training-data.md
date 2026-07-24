---
id: CON-AI-006
name: TrainingData
context: BC-AI
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - training
  - data
---

# TrainingData

## Definition

An immutable value object representing the dataset used to train an AI model. Encapsulates data source, feature configuration, and data quality metrics.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| source_type | enum | yes | database, file, api, stream |
| source_config | json | yes | Connection or access configuration |
| feature_columns | array<string> | yes | Input feature names |
| target_column | string | yes | Target variable name |
| row_count | integer | yes | Number of training records |
| date_range_start | date | no | Training data start date |
| date_range_end | date | no | Training data end date |
| quality_score | decimal(5,4) | no | Data quality score (0.0-1.0) |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-005 (AIModel) | used-by | 1:N | Models trained on this data |

## Invariants

- INV-AI-011: feature_columns must not be empty.
- INV-AI-012: target_column must exist in source data.
- INV-AI-013: quality_score must be between 0.0 and 1.0 when provided.

## Business Rules

- Training data must be validated before model training.
- Data quality issues must be documented.

## Events

- TrainingDataValidated

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
