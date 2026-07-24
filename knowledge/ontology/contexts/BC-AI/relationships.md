---
title: BC-AI Relationships
context: BC-AI
version: 1.0.0
status: active
---

# BC-AI Relationships

## Internal Relationships (within BC-AI)

| ID | Source | Target | Type | Cardinality | Description |
|----|--------|--------|------|-------------|-------------|
| REL-AI-001 | CON-AI-001 (Workflow) | CON-AI-002 (WorkflowStep) | has-many | 1:N | Workflow contains ordered steps |
| REL-AI-002 | CON-AI-002 (WorkflowStep) | CON-AI-001 (Workflow) | belongs-to | N:1 | Step belongs to a workflow |
| REL-AI-003 | CON-AI-003 (Prediction) | CON-AI-005 (AIModel) | uses | N:1 | Prediction uses a model |
| REL-AI-004 | CON-AI-005 (AIModel) | CON-AI-006 (TrainingData) | uses | N:1 | Model trained on data |
| REL-AI-005 | CON-AI-003 (Prediction) | CON-AI-007 (PredictionResult) | produces | 1:1 | Prediction produces result |
| REL-AI-006 | CON-AI-004 (AnomalyDetection) | CON-AI-005 (AIModel) | uses | N:1 | Detection uses a model |
| REL-AI-007 | CON-AI-008 (AutomationTrigger) | CON-AI-001 (Workflow) | triggers | N:1 | Trigger fires workflow |
| REL-AI-008 | CON-AI-012 (CreateWorkflow) | CON-AI-001 (Workflow) | creates | 1:1 | Command creates workflow |
| REL-AI-009 | CON-AI-012 (CreateWorkflow) | CON-AI-009 (WorkflowCreated) | produces | 1:1 | Command emits event |
| REL-AI-010 | CON-AI-013 (RunPrediction) | CON-AI-003 (Prediction) | creates | 1:1 | Command creates prediction |
| REL-AI-011 | CON-AI-013 (RunPrediction) | CON-AI-010 (PredictionGenerated) | produces | 1:1 | Command emits event |
| REL-AI-012 | CON-AI-013 (RunPrediction) | CON-AI-011 (AnomalyDetected) | may-produce | 0:1 | Command may emit event |
| REL-AI-013 | CON-AI-014 (TrainModel) | CON-AI-005 (AIModel) | creates | 1:1 | Command creates model |
| REL-AI-014 | CON-AI-014 (TrainModel) | CON-AI-006 (TrainingData) | uses | 1:1 | Command uses training data |
| REL-AI-015 | CON-AI-015 (ModelAccuracyPolicy) | CON-AI-005 (AIModel) | enforces | 1:N | Policy enforces model quality |
| REL-AI-016 | CON-AI-016 (AutomationSafetyPolicy) | CON-AI-001 (Workflow) | enforces | 1:N | Policy enforces workflow safety |

## Cross-Context Relationships

| ID | Source | Target | Type | Description |
|----|--------|--------|------|-------------|
| REL-AI-X01 | CON-AI-009 (WorkflowCreated) | BC-FIN entities | triggers | Workflow creation may trigger financial processes |
| REL-AI-X02 | CON-AI-010 (PredictionGenerated) | BC-INV entities | triggers | Stock predictions update inventory |
| REL-AI-X03 | CON-AI-011 (AnomalyDetected) | BC-FIN entities | triggers | Financial anomaly alerts |

## Notes

- All cross-context communication uses domain events only (INV-CROSS-002).
- No bounded context may directly access another context's database tables (INV-CROSS-001).
