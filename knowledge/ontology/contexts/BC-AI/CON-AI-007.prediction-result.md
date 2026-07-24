---
id: CON-AI-007
name: PredictionResult
context: BC-AI
type: value_object
version: 1.0.0
status: active
owners:
  - Product Ontologist
tags:
  - ai
  - prediction
  - result
---

# PredictionResult

## Definition

An immutable value object containing the output of an AI prediction. Encapsulates the predicted value, confidence score, and explanatory factors.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| predicted_value | json | yes | Predicted output (type depends on prediction_type) |
| confidence_score | decimal(5,4) | yes | Confidence in prediction (0.0-1.0) |
| explanation | json | no | Model explanation / feature importance |
| recommendation | string(500) | no | Suggested action based on prediction |
| generated_at | timestamp | yes | Result generation timestamp |

## Relationships

| Target | Type | Cardinality | Description |
|--------|------|-------------|-------------|
| CON-AI-003 (Prediction) | produced-by | N:1 | Parent prediction |

## Invariants

- INV-AI-014: confidence_score must be between 0.0 and 1.0.
- INV-AI-015: predicted_value must not be null.

## Business Rules

- Prediction results are immutable once generated.
- Low-confidence predictions should trigger review workflows.

## Events

- None (value object)

## References

- [Domain Constitution - BC-AI](../../constitution/DOMAIN.md)
