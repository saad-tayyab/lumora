import { and, asc, count, desc, eq, type SQL } from 'drizzle-orm';

import { db } from '../../index';
import type {
  AiModel,
  AnomalyDetection,
  NewAiModel,
  NewAnomalyDetection,
  NewPrediction,
  NewTrainingData,
  NewWorkflow,
  NewWorkflowStep,
  Prediction,
  TrainingData,
  Workflow,
  WorkflowStep,
} from './schema';
import {
  aiModels,
  anomalyDetections,
  predictions,
  trainingData,
  workflowSteps,
  workflows,
} from './schema';

// ─── FindMany args ────────────────────────────────────────────────────────────

export type FindManyArgs = {
  limit?: number;
  offset?: number;
  orderBy?: SQL;
};

// ─── Workflows ────────────────────────────────────────────────────────────────

export const workflowsRepository = {
  async findById(id: string): Promise<Workflow | undefined> {
    return db.query.workflows.findFirst({ where: eq(workflows.id, id) });
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Workflow[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(workflows.name) } = args ?? {};
    const data = await db.query.workflows.findMany({
      where: eq(workflows.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(workflows)
      .where(eq(workflows.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(
    status: Workflow['status'],
    args?: FindManyArgs,
  ): Promise<{ data: Workflow[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(workflows.name) } = args ?? {};
    const data = await db.query.workflows.findMany({
      where: eq(workflows.status, status),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(workflows)
      .where(eq(workflows.status, status));
    return { data, total: total[0].count, limit, offset };
  },

  async findByTriggerType(
    triggerType: string,
    args?: FindManyArgs,
  ): Promise<{ data: Workflow[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(workflows.name) } = args ?? {};
    const data = await db.query.workflows.findMany({
      where: eq(workflows.triggerType, triggerType),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(workflows)
      .where(eq(workflows.triggerType, triggerType));
    return { data, total: total[0].count, limit, offset };
  },

  async findByCreatedBy(
    createdBy: string,
    args?: FindManyArgs,
  ): Promise<{ data: Workflow[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(workflows.name) } = args ?? {};
    const data = await db.query.workflows.findMany({
      where: eq(workflows.createdBy, createdBy),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(workflows)
      .where(eq(workflows.createdBy, createdBy));
    return { data, total: total[0].count, limit, offset };
  },

  async findActive(args?: FindManyArgs): Promise<{
    data: Workflow[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(workflows.name) } = args ?? {};
    const data = await db.query.workflows.findMany({
      where: eq(workflows.status, 'active'),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(workflows)
      .where(eq(workflows.status, 'active'));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: Workflow[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(workflows.id) } = args ?? {};
    const data = await db.query.workflows.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(workflows);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewWorkflow): Promise<Workflow[]> {
    return db.insert(workflows).values(data).returning();
  },

  async update(id: string, data: Partial<NewWorkflow>): Promise<Workflow[]> {
    return db.update(workflows).set(data).where(eq(workflows.id, id)).returning();
  },

  async delete(id: string): Promise<Workflow[]> {
    return db.delete(workflows).where(eq(workflows.id, id)).returning();
  },
};

// ─── Workflow Steps ───────────────────────────────────────────────────────────

export const workflowStepsRepository = {
  async findById(id: string): Promise<WorkflowStep | undefined> {
    return db.query.workflowSteps.findFirst({ where: eq(workflowSteps.id, id) });
  },

  async findByWorkflowId(
    workflowId: string,
    args?: FindManyArgs,
  ): Promise<{ data: WorkflowStep[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(workflowSteps.stepOrder) } = args ?? {};
    const data = await db.query.workflowSteps.findMany({
      where: eq(workflowSteps.workflowId, workflowId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(workflowSteps)
      .where(eq(workflowSteps.workflowId, workflowId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStepType(
    stepType: string,
    args?: FindManyArgs,
  ): Promise<{ data: WorkflowStep[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(workflowSteps.stepOrder) } = args ?? {};
    const data = await db.query.workflowSteps.findMany({
      where: eq(workflowSteps.stepType, stepType),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(workflowSteps)
      .where(eq(workflowSteps.stepType, stepType));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: WorkflowStep[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(workflowSteps.id) } = args ?? {};
    const data = await db.query.workflowSteps.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(workflowSteps);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewWorkflowStep): Promise<WorkflowStep[]> {
    return db.insert(workflowSteps).values(data).returning();
  },

  async update(id: string, data: Partial<NewWorkflowStep>): Promise<WorkflowStep[]> {
    return db.update(workflowSteps).set(data).where(eq(workflowSteps.id, id)).returning();
  },

  async delete(id: string): Promise<WorkflowStep[]> {
    return db.delete(workflowSteps).where(eq(workflowSteps.id, id)).returning();
  },

  async deleteByWorkflowId(workflowId: string): Promise<WorkflowStep[]> {
    return db.delete(workflowSteps).where(eq(workflowSteps.workflowId, workflowId)).returning();
  },
};

// ─── AI Models ────────────────────────────────────────────────────────────────

export const aiModelsRepository = {
  async findById(id: string): Promise<AiModel | undefined> {
    return db.query.aiModels.findFirst({ where: eq(aiModels.id, id) });
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: AiModel[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(aiModels.name) } = args ?? {};
    const data = await db.query.aiModels.findMany({
      where: eq(aiModels.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(aiModels)
      .where(eq(aiModels.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByModelType(
    modelType: string,
    args?: FindManyArgs,
  ): Promise<{ data: AiModel[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(aiModels.name) } = args ?? {};
    const data = await db.query.aiModels.findMany({
      where: eq(aiModels.modelType, modelType),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(aiModels)
      .where(eq(aiModels.modelType, modelType));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(
    status: AiModel['status'],
    args?: FindManyArgs,
  ): Promise<{ data: AiModel[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(aiModels.name) } = args ?? {};
    const data = await db.query.aiModels.findMany({
      where: eq(aiModels.status, status),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(aiModels)
      .where(eq(aiModels.status, status));
    return { data, total: total[0].count, limit, offset };
  },

  async findByTrainingDataId(
    trainingDataId: string,
    args?: FindManyArgs,
  ): Promise<{ data: AiModel[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = asc(aiModels.name) } = args ?? {};
    const data = await db.query.aiModels.findMany({
      where: eq(aiModels.trainingDataId, trainingDataId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(aiModels)
      .where(eq(aiModels.trainingDataId, trainingDataId));
    return { data, total: total[0].count, limit, offset };
  },

  async findActive(args?: FindManyArgs): Promise<{
    data: AiModel[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(aiModels.name) } = args ?? {};
    const data = await db.query.aiModels.findMany({
      where: eq(aiModels.status, 'active'),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(aiModels)
      .where(eq(aiModels.status, 'active'));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: AiModel[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = asc(aiModels.id) } = args ?? {};
    const data = await db.query.aiModels.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(aiModels);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewAiModel): Promise<AiModel[]> {
    return db.insert(aiModels).values(data).returning();
  },

  async update(id: string, data: Partial<NewAiModel>): Promise<AiModel[]> {
    return db.update(aiModels).set(data).where(eq(aiModels.id, id)).returning();
  },

  async delete(id: string): Promise<AiModel[]> {
    return db.delete(aiModels).where(eq(aiModels.id, id)).returning();
  },
};

// ─── Training Data ────────────────────────────────────────────────────────────

export const trainingDataRepository = {
  async findById(id: string): Promise<TrainingData | undefined> {
    return db.query.trainingData.findFirst({ where: eq(trainingData.id, id) });
  },

  async findBySourceType(
    sourceType: string,
    args?: FindManyArgs,
  ): Promise<{ data: TrainingData[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(trainingData.createdAt) } = args ?? {};
    const data = await db.query.trainingData.findMany({
      where: eq(trainingData.sourceType, sourceType),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(trainingData)
      .where(eq(trainingData.sourceType, sourceType));
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: TrainingData[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = desc(trainingData.createdAt) } = args ?? {};
    const data = await db.query.trainingData.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(trainingData);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewTrainingData): Promise<TrainingData[]> {
    return db.insert(trainingData).values(data).returning();
  },

  async update(id: string, data: Partial<NewTrainingData>): Promise<TrainingData[]> {
    return db.update(trainingData).set(data).where(eq(trainingData.id, id)).returning();
  },

  async delete(id: string): Promise<TrainingData[]> {
    return db.delete(trainingData).where(eq(trainingData.id, id)).returning();
  },
};

// ─── Predictions ──────────────────────────────────────────────────────────────

export const predictionsRepository = {
  async findById(id: string): Promise<Prediction | undefined> {
    return db.query.predictions.findFirst({ where: eq(predictions.id, id) });
  },

  async findByModelId(
    modelId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Prediction[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(predictions.generatedAt) } = args ?? {};
    const data = await db.query.predictions.findMany({
      where: eq(predictions.modelId, modelId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(predictions)
      .where(eq(predictions.modelId, modelId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Prediction[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(predictions.generatedAt) } = args ?? {};
    const data = await db.query.predictions.findMany({
      where: eq(predictions.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(predictions)
      .where(eq(predictions.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByPredictionType(
    predictionType: string,
    args?: FindManyArgs,
  ): Promise<{ data: Prediction[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(predictions.generatedAt) } = args ?? {};
    const data = await db.query.predictions.findMany({
      where: eq(predictions.predictionType, predictionType),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(predictions)
      .where(eq(predictions.predictionType, predictionType));
    return { data, total: total[0].count, limit, offset };
  },

  async findByEntityType(
    entityType: string,
    entityId: string,
    args?: FindManyArgs,
  ): Promise<{ data: Prediction[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(predictions.generatedAt) } = args ?? {};
    const condition = and(
      eq(predictions.entityType, entityType),
      eq(predictions.entityId, entityId),
    );
    const data = await db.query.predictions.findMany({
      where: condition,
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(predictions).where(condition);
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: Prediction[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = desc(predictions.generatedAt) } = args ?? {};
    const data = await db.query.predictions.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(predictions);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewPrediction): Promise<Prediction[]> {
    return db.insert(predictions).values(data).returning();
  },

  async update(id: string, data: Partial<NewPrediction>): Promise<Prediction[]> {
    return db.update(predictions).set(data).where(eq(predictions.id, id)).returning();
  },

  async delete(id: string): Promise<Prediction[]> {
    return db.delete(predictions).where(eq(predictions.id, id)).returning();
  },
};

// ─── Anomaly Detections ───────────────────────────────────────────────────────

export const anomalyDetectionsRepository = {
  async findById(id: string): Promise<AnomalyDetection | undefined> {
    return db.query.anomalyDetections.findFirst({ where: eq(anomalyDetections.id, id) });
  },

  async findByModelId(
    modelId: string,
    args?: FindManyArgs,
  ): Promise<{ data: AnomalyDetection[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(anomalyDetections.detectedAt) } = args ?? {};
    const data = await db.query.anomalyDetections.findMany({
      where: eq(anomalyDetections.modelId, modelId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(anomalyDetections)
      .where(eq(anomalyDetections.modelId, modelId));
    return { data, total: total[0].count, limit, offset };
  },

  async findByTenantId(
    tenantId: string,
    args?: FindManyArgs,
  ): Promise<{ data: AnomalyDetection[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(anomalyDetections.detectedAt) } = args ?? {};
    const data = await db.query.anomalyDetections.findMany({
      where: eq(anomalyDetections.tenantId, tenantId),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(anomalyDetections)
      .where(eq(anomalyDetections.tenantId, tenantId));
    return { data, total: total[0].count, limit, offset };
  },

  async findBySeverity(
    severity: AnomalyDetection['severity'],
    args?: FindManyArgs,
  ): Promise<{ data: AnomalyDetection[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(anomalyDetections.detectedAt) } = args ?? {};
    const data = await db.query.anomalyDetections.findMany({
      where: eq(anomalyDetections.severity, severity),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(anomalyDetections)
      .where(eq(anomalyDetections.severity, severity));
    return { data, total: total[0].count, limit, offset };
  },

  async findByStatus(
    status: AnomalyDetection['status'],
    args?: FindManyArgs,
  ): Promise<{ data: AnomalyDetection[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(anomalyDetections.detectedAt) } = args ?? {};
    const data = await db.query.anomalyDetections.findMany({
      where: eq(anomalyDetections.status, status),
      limit,
      offset,
      orderBy,
    });
    const total = await db
      .select({ count: count() })
      .from(anomalyDetections)
      .where(eq(anomalyDetections.status, status));
    return { data, total: total[0].count, limit, offset };
  },

  async findByEntityType(
    entityType: string,
    entityId: string,
    args?: FindManyArgs,
  ): Promise<{ data: AnomalyDetection[]; total: number; limit: number; offset: number }> {
    const { limit = 50, offset = 0, orderBy = desc(anomalyDetections.detectedAt) } = args ?? {};
    const condition = and(
      eq(anomalyDetections.entityType, entityType),
      eq(anomalyDetections.entityId, entityId),
    );
    const data = await db.query.anomalyDetections.findMany({
      where: condition,
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(anomalyDetections).where(condition);
    return { data, total: total[0].count, limit, offset };
  },

  async findUnresolved(args?: FindManyArgs): Promise<{
    data: AnomalyDetection[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = desc(anomalyDetections.detectedAt) } = args ?? {};
    const condition = and(eq(anomalyDetections.status, 'detected'));
    const data = await db.query.anomalyDetections.findMany({
      where: condition,
      limit,
      offset,
      orderBy,
    });
    const total = await db.select({ count: count() }).from(anomalyDetections).where(condition);
    return { data, total: total[0].count, limit, offset };
  },

  async findMany(args?: FindManyArgs): Promise<{
    data: AnomalyDetection[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0, orderBy = desc(anomalyDetections.detectedAt) } = args ?? {};
    const data = await db.query.anomalyDetections.findMany({ limit, offset, orderBy });
    const total = await db.select({ count: count() }).from(anomalyDetections);
    return { data, total: total[0].count, limit, offset };
  },

  async create(data: NewAnomalyDetection): Promise<AnomalyDetection[]> {
    return db.insert(anomalyDetections).values(data).returning();
  },

  async update(id: string, data: Partial<NewAnomalyDetection>): Promise<AnomalyDetection[]> {
    return db.update(anomalyDetections).set(data).where(eq(anomalyDetections.id, id)).returning();
  },

  async delete(id: string): Promise<AnomalyDetection[]> {
    return db.delete(anomalyDetections).where(eq(anomalyDetections.id, id)).returning();
  },
};
