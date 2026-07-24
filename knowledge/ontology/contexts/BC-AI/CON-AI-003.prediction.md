---
id: CON-AI-003
name: Prediction
context: BC-AI
type: aggregate
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - prediction
  - analytics
  - core
---

# Prediction

## Definition

An aggregate root representing an AI-generated forecast or classification. Predictions use trained models to analyze data and produce actionable insights across business domains.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID v7 | yes | Unique identifier |
| model_id | UUID v7 | yes | AI model used for prediction |
| prediction_type | enum | yes | classification, regression, anomaly, forecast |
| input_data | json | yes | Input features for prediction |
| entity_type | string(100) | yes | Business entity being predicted (e.g., "invoice", "stock_item") |
| entity_id | UUID v7 | yes | Specific entity reference |
| tenant_id | UUID v7 | yes | Tenant owner |
| created_at | timestamp | yes | Prediction timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-005 (AIModel) | uses | N:1 | Model used for this prediction |
| CON-AI-007 (PredictionResult) | produces | 1:1 | Prediction output |

## Invariants

- INV-AI-005: Every prediction must reference a valid AIModel.
- INV-AI-006: Prediction type must match model capability.
- INV-CROSS-003: Prediction ID is a globally unique UUID v7.

## Business Rules

- Predictions are immutable once generated.
- Prediction confidence is recorded with the result.

## Events

- PredictionGenerated (CON-AI-010)

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
