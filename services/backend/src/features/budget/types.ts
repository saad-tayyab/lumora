import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────────────

export const UuidSchema = z.string().uuid();

export const DecimalStringSchema = z
  .string()
  .regex(/^\d+(\.\d{1,4})?$/, 'Must be a decimal number with up to 4 decimal places');

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Budget Header Types ────────────────────────────────────────────────

export const CreateBudgetHeaderSchema = z
  .object({
    name: z.string().min(1, 'Budget name is required').max(100),
    description: z.string().optional(),
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    totalAmount: DecimalStringSchema.default('0'),
  })
  .refine((data) => new Date(data.periodStart) < new Date(data.periodEnd), {
    message: 'Period end date must be after period start date',
  });

export interface CreateBudgetHeaderRequest {
  name: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  totalAmount?: string;
}

export const UpdateBudgetHeaderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
  isActive: z.boolean().optional(),
});

export interface UpdateBudgetHeaderRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'closed';
  isActive?: boolean;
}

export interface BudgetHeaderResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  description: string | null;
  periodStart: string;
  periodEnd: string;
  totalAmount: string;
  status: string;
  isActive: boolean;
}

// ─── Budget Line Types ──────────────────────────────────────────────────

export const CreateBudgetLineSchema = z.object({
  glAccountId: UuidSchema,
  description: z.string().max(200).optional(),
  budgetAmount: DecimalStringSchema.default('0'),
});

export interface CreateBudgetLineRequest {
  glAccountId: string;
  description?: string;
  budgetAmount?: string;
}

export const UpdateBudgetLineSchema = z.object({
  description: z.string().max(200).optional(),
  budgetAmount: DecimalStringSchema.optional(),
  isActive: z.boolean().optional(),
});

export interface UpdateBudgetLineRequest {
  description?: string;
  budgetAmount?: string;
  isActive?: boolean;
}

export interface BudgetLineResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  budgetHeaderId: string;
  glAccountId: string;
  description: string | null;
  budgetAmount: string;
  consumedAmount: string;
  varianceAmount: string;
  isActive: boolean;
}

// ─── Budget Consumption Types ───────────────────────────────────────────

export const CreateBudgetConsumptionSchema = z
  .object({
    budgetLineId: UuidSchema,
    journalEntryId: UuidSchema.optional(),
    amount: DecimalStringSchema,
    description: z.string().optional(),
    consumptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  })
  .refine((data) => Number(data.amount) >= 0, {
    message: 'Consumption amount must be non-negative',
  });

export interface CreateBudgetConsumptionRequest {
  budgetLineId: string;
  journalEntryId?: string;
  amount: string;
  description?: string;
  consumptionDate: string;
}

export const ReversalBudgetConsumptionSchema = z.object({
  journalEntryId: UuidSchema,
});

export interface ReversalBudgetConsumptionRequest {
  journalEntryId: string;
}

export interface BudgetConsumptionResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  budgetLineId: string;
  journalEntryId: string | null;
  amount: string;
  description: string | null;
  consumptionDate: string;
}

// ─── List Wrapper (Encore array return workaround) ───────────────────────

export interface BudgetVarianceListResponse {
  items: BudgetVarianceResponse[];
}

// ─── Budget Variance Types ──────────────────────────────────────────────

export interface BudgetVarianceResponse {
  budgetLineId: string;
  glAccountId: string;
  budgetAmount: string;
  consumedAmount: string;
  varianceAmount: string;
}

// ─── Budget Header with Lines ───────────────────────────────────────────

export interface BudgetHeaderWithLines extends BudgetHeaderResponse {
  lines: BudgetLineResponse[];
}
