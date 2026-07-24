---
title: BC-AI Ontology
context: BC-AI
version: 1.0.0
status: active
---

# BC-AI — AI & Automation

## Overview

This directory contains ontology concepts for the AI & Automation bounded context, covering workflows, predictions, anomaly detection, and AI model management.

## Concepts (16)

| ID | Name | Type |
|----|------|------|
| CON-AI-001 | Workflow | aggregate |
| CON-AI-002 | WorkflowStep | entity |
| CON-AI-003 | Prediction | aggregate |
| CON-AI-004 | AnomalyDetection | entity |
| CON-AI-005 | AIModel | entity |
| CON-AI-006 | TrainingData | value_object |
| CON-AI-007 | PredictionResult | value_object |
| CON-AI-008 | AutomationTrigger | value_object |
| CON-AI-009 | WorkflowCreated | event |
| CON-AI-010 | PredictionGenerated | event |
| CON-AI-011 | AnomalyDetected | event |
| CON-AI-012 | CreateWorkflow | command |
| CON-AI-013 | RunPrediction | command |
| CON-AI-014 | TrainModel | command |
| CON-AI-015 | ModelAccuracyPolicy | policy |
| CON-AI-016 | AutomationSafetyPolicy | policy |

## Aggregate Boundaries

- **Workflow Aggregate:** Workflow + WorkflowStep + AutomationTrigger
- **Prediction Aggregate:** Prediction + PredictionResult + AIModel
- **AnomalyDetection Entity:** Standalone, references AIModel

## Invariants

- INV-AI-001: Workflow must have at least one WorkflowStep.
- INV-AI-002: Workflow status transitions follow defined lifecycle.
- INV-AI-003: step_order unique within workflow.
- INV-AI-005: Every prediction must reference a valid AIModel.
- INV-AI-007: anomaly_score between 0.0 and 1.0.
- INV-AI-010: Only one active version per model name.
- INV-AI-030: ModelAccuracyPolicy enforced at deployment.
- INV-AI-033: AutomationSafetyPolicy enforced at execution.

## References

- [Domain Constitution](../../constitution/DOMAIN.md)
- [AI Constitution](../../constitution/AI.md)
- [Ontology Standards](../STANDARDS.md)
