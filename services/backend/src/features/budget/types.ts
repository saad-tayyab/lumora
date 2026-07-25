import type { BudgetConsumption, BudgetHeader, BudgetLine } from '@lumora/database/schema';
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

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

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

export type CreateBudgetHeaderRequest = z.infer<typeof CreateBudgetHeaderSchema>;

export const UpdateBudgetHeaderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateBudgetHeaderRequest = z.infer<typeof UpdateBudgetHeaderSchema>;

export type BudgetHeaderResponse = BudgetHeader;

// ─── Budget Line Types ──────────────────────────────────────────────────

export const CreateBudgetLineSchema = z.object({
  glAccountId: UuidSchema,
  description: z.string().max(200).optional(),
  budgetAmount: DecimalStringSchema.default('0'),
});

export type CreateBudgetLineRequest = z.infer<typeof CreateBudgetLineSchema>;

export const UpdateBudgetLineSchema = z.object({
  description: z.string().max(200).optional(),
  budgetAmount: DecimalStringSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateBudgetLineRequest = z.infer<typeof UpdateBudgetLineSchema>;

export type BudgetLineResponse = BudgetLine;

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

export type CreateBudgetConsumptionRequest = z.infer<typeof CreateBudgetConsumptionSchema>;

export const ReversalBudgetConsumptionSchema = z.object({
  journalEntryId: UuidSchema,
});

export type ReversalBudgetConsumptionRequest = z.infer<typeof ReversalBudgetConsumptionSchema>;

export type BudgetConsumptionResponse = BudgetConsumption;

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
