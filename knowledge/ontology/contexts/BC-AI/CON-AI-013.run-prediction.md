---
id: CON-AI-013
name: RunPrediction
context: BC-AI
type: command
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - prediction
  - command
---

# RunPrediction

## Definition

A command representing the intent to execute an AI prediction against a model. Encapsulates input data and model selection.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| model_id | UUID v7 | yes | AI model to use |
| prediction_type | enum | yes | classification, regression, anomaly, forecast |
| input_data | json | yes | Input features for prediction |
| entity_type | string(100) | yes | Business entity type |
| entity_id | UUID v7 | yes | Specific entity reference |
| tenant_id | UUID v7 | yes | Tenant owner |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-003 (Prediction) | creates | 1:1 | Prediction to be generated |
| CON-AI-010 (PredictionGenerated) | produces | 1:1 | Event emitted on success |
| CON-AI-011 (AnomalyDetected) | may-produce | 0:1 | Event if anomaly detected |

## Invariants

- INV-AI-024: model_id must reference an active AIModel.
- INV-AI-025: input_data must match model's expected schema.

## Business Rules

- Prediction requests validate model availability before execution.
- Failed predictions emit appropriate error events.

## Events

- PredictionGenerated (CON-AI-010) on success
- AnomalyDetected (CON-AI-011) if anomaly found

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
