import {
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import { auditFields, createdByFields, softDeleteFields, tenantFields } from '../common/audit';

// ─── Tables ───────────────────────────────────────────────────────────────────

// ── Workflows ─────────────────────────────────────────────────────────────────

export const workflows = pgTable(
  'workflows',
  {
    ...auditFields,
    name: varchar('name', { length: 200 }).notNull(),
    description: varchar('description', { length: 1000 }),
    // status: draft | active | paused | completed | failed
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    // triggerType: event | manual | schedule | cron
    triggerType: varchar('trigger_type', { length: 20 }).notNull(),
    createdBy: createdByFields.createdBy,
    ...tenantFields,
    ...softDeleteFields,
  },
  (table) => [
    index('idx_workflows_tenant_id').on(table.tenantId),
    index('idx_workflows_status').on(table.status),
    index('idx_workflows_created_by').on(table.createdBy),
    index('idx_workflows_trigger_type').on(table.triggerType),
  ],
);

// ── Workflow Steps ────────────────────────────────────────────────────────────

export const workflowSteps = pgTable(
  'workflow_steps',
  {
    ...auditFields,
    workflowId: uuid('workflow_id')
      .notNull()
      .references(() => workflows.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    stepOrder: integer('step_order').notNull(),
    // stepType: action | condition | approval | notification | ai_task
    stepType: varchar('step_type', { length: 20 }).notNull(),
    inputSchema: jsonb('input_schema').notNull(),
    outputSchema: jsonb('output_schema').notNull(),
    timeoutSeconds: integer('timeout_seconds'),
    retryCount: integer('retry_count'),
  },
  (table) => [
    index('idx_workflow_steps_workflow_id').on(table.workflowId),
    index('idx_workflow_steps_step_order').on(table.stepOrder),
  ],
);

// ── AI Models ─────────────────────────────────────────────────────────────────

export const aiModels = pgTable(
  'ai_models',
  {
    id: auditFields.id,
    name: varchar('name', { length: 200 }).notNull(),
    // modelType: regression | classification | clustering | anomaly | rules
    modelType: varchar('model_type', { length: 20 }).notNull(),
    version: varchar('version', { length: 50 }).notNull(),
    // status: training | active | deprecated | failed
    status: varchar('status', { length: 20 }).notNull().default('training'),
    accuracyScore: decimal('accuracy_score', { precision: 5, scale: 4 }),
    trainingDataId: uuid('training_data_id').references(() => trainingData.id),
    config: jsonb('config').notNull(),
    ...tenantFields,
    ...softDeleteFields,
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
    deployedAt: timestamp('deployed_at'),
  },
  (table) => [
    index('idx_ai_models_tenant_id').on(table.tenantId),
    index('idx_ai_models_status').on(table.status),
    index('idx_ai_models_model_type').on(table.modelType),
  ],
);

// ── Training Data ─────────────────────────────────────────────────────────────

export const trainingData = pgTable(
  'training_data',
  {
    id: auditFields.id,
    // sourceType: database | file | api | stream
    sourceType: varchar('source_type', { length: 20 }).notNull(),
    sourceConfig: jsonb('source_config').notNull(),
    featureColumns: jsonb('feature_columns').notNull(),
    targetColumn: text('target_column').notNull(),
    rowCount: integer('row_count').notNull().default(0),
    dateRangeStart: date('date_range_start'),
    dateRangeEnd: date('date_range_end'),
    qualityScore: decimal('quality_score', { precision: 5, scale: 4 }),
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
  },
  (table) => [index('idx_training_data_source_type').on(table.sourceType)],
);

// ── Predictions ───────────────────────────────────────────────────────────────

export const predictions = pgTable(
  'predictions',
  {
    id: auditFields.id,
    modelId: uuid('model_id')
      .notNull()
      .references(() => aiModels.id),
    // predictionType: classification | regression | anomaly | forecast
    predictionType: varchar('prediction_type', { length: 20 }).notNull(),
    inputData: jsonb('input_data').notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    predictedValue: jsonb('predicted_value').notNull(),
    confidenceScore: decimal('confidence_score', { precision: 5, scale: 4 }).notNull(),
    explanation: jsonb('explanation'),
    recommendation: varchar('recommendation', { length: 500 }),
    ...tenantFields,
    createdAt: auditFields.createdAt,
    updatedAt: auditFields.updatedAt,
    generatedAt: timestamp('generated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_predictions_model_id').on(table.modelId),
    index('idx_predictions_prediction_type').on(table.predictionType),
    index('idx_predictions_tenant_id').on(table.tenantId),
    index('idx_predictions_entity_type').on(table.entityType),
  ],
);

// ── Anomaly Detections ────────────────────────────────────────────────────────

export const anomalyDetections = pgTable(
  'anomaly_detections',
  {
    ...auditFields,
    modelId: uuid('model_id')
      .notNull()
      .references(() => aiModels.id),
    dataSource: varchar('data_source', { length: 200 }).notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    anomalyScore: decimal('anomaly_score', { precision: 5, scale: 4 }).notNull(),
    // severity: low | medium | high | critical
    severity: varchar('severity', { length: 10 }).notNull(),
    // status: detected | investigating | resolved | dismissed
    status: varchar('status', { length: 20 }).notNull().default('detected'),
    detectedAt: timestamp('detected_at').notNull(),
    ...tenantFields,
  },
  (table) => [
    index('idx_anomaly_detections_model_id').on(table.modelId),
    index('idx_anomaly_detections_tenant_id').on(table.tenantId),
    index('idx_anomaly_detections_severity').on(table.severity),
    index('idx_anomaly_detections_status').on(table.status),
    index('idx_anomaly_detections_detected_at').on(table.detectedAt),
  ],
);

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertWorkflowSchema = createInsertSchema(workflows, {
  name: (schema) => schema.min(1).max(200),
});
export const selectWorkflowSchema = createSelectSchema(workflows);

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps, {
  name: (schema) => schema.min(1).max(200),
});
export const selectWorkflowStepSchema = createSelectSchema(workflowSteps);

export const insertAiModelSchema = createInsertSchema(aiModels, {
  name: (schema) => schema.min(1).max(200),
  version: (schema) => schema.min(1).max(50),
});
export const selectAiModelSchema = createSelectSchema(aiModels);

export const insertTrainingDataSchema = createInsertSchema(trainingData);
export const selectTrainingDataSchema = createSelectSchema(trainingData);

export const insertPredictionSchema = createInsertSchema(predictions);
export const selectPredictionSchema = createSelectSchema(predictions);

export const insertAnomalyDetectionSchema = createInsertSchema(anomalyDetections);
export const selectAnomalyDetectionSchema = createSelectSchema(anomalyDetections);

export const updateWorkflowSchema = createUpdateSchema(workflows);
export const updateWorkflowStepSchema = createUpdateSchema(workflowSteps);
export const updateAiModelSchema = createUpdateSchema(aiModels);
export const updateTrainingDataSchema = createUpdateSchema(trainingData);
export const updatePredictionSchema = createUpdateSchema(predictions);
export const updateAnomalyDetectionSchema = createUpdateSchema(anomalyDetections);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type NewWorkflowStep = typeof workflowSteps.$inferInsert;

export type AiModel = typeof aiModels.$inferSelect;
export type NewAiModel = typeof aiModels.$inferInsert;

export type TrainingData = typeof trainingData.$inferSelect;
export type NewTrainingData = typeof trainingData.$inferInsert;

export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = typeof predictions.$inferInsert;

export type AnomalyDetection = typeof anomalyDetections.$inferSelect;
export type NewAnomalyDetection = typeof anomalyDetections.$inferInsert;
