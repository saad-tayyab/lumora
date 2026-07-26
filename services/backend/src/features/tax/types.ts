import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────────────────

export const UuidSchema = z.string().uuid();

export const DecimalStringSchema = z
  .string()
  .regex(/^\d+(\.\d{1,4})?$/, 'Must be a decimal number with up to 4 decimal places');

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

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

// ─── Tax Code Types ──────────────────────────────────────────────────────────

export const CreateTaxCodeSchema = z.object({
  code: z.string().min(1, 'Tax code is required').max(20),
  name: z.string().min(1, 'Tax code name is required').max(100),
  type: z.enum(['sales_tax', 'vat', 'gst', 'excise', 'withholding']),
  glAccountId: UuidSchema,
  isClaimable: z.boolean().default(false),
  postingRule: z.enum(['output_liability', 'input_asset', 'expense']).default('output_liability'),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

export interface CreateTaxCodeRequest {
  code: string;
  name: string;
  type: 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
  glAccountId: string;
  isClaimable?: boolean;
  postingRule?: 'output_liability' | 'input_asset' | 'expense';
  isActive?: boolean;
  description?: string;
}

export const UpdateTaxCodeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['sales_tax', 'vat', 'gst', 'excise', 'withholding']).optional(),
  glAccountId: UuidSchema.optional(),
  isClaimable: z.boolean().optional(),
  postingRule: z.enum(['output_liability', 'input_asset', 'expense']).optional(),
  isActive: z.boolean().optional(),
  description: z.string().nullable().optional(),
});

export interface UpdateTaxCodeRequest {
  name?: string;
  type?: 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
  glAccountId?: string;
  isClaimable?: boolean;
  postingRule?: 'output_liability' | 'input_asset' | 'expense';
  isActive?: boolean;
  description?: string | null;
}

export interface TaxCodeResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  code: string;
  name: string;
  type: 'sales_tax' | 'vat' | 'gst' | 'excise' | 'withholding';
  glAccountId: string;
  isClaimable: boolean;
  postingRule: 'output_liability' | 'input_asset' | 'expense';
  isActive: boolean;
  description: string | null;
}

// ─── Tax Rate Types ─────────────────────────────────────────────────────────

export const CreateTaxRateSchema = z
  .object({
    taxCodeId: UuidSchema,
    rate: DecimalStringSchema,
    effectiveDate: DateSchema,
    expiryDate: DateSchema.nullable().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.expiryDate && data.expiryDate !== null) {
        return data.expiryDate > data.effectiveDate;
      }
      return true;
    },
    {
      message: 'Expiry date must be after the effective date',
      path: ['expiryDate'],
    },
  );

export interface CreateTaxRateRequest {
  taxCodeId: string;
  rate: string;
  effectiveDate: string;
  expiryDate?: string | null;
  description?: string;
  isActive?: boolean;
}

export const UpdateTaxRateSchema = z
  .object({
    rate: DecimalStringSchema.optional(),
    effectiveDate: DateSchema.optional(),
    expiryDate: DateSchema.nullable().optional(),
    description: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.expiryDate && data.expiryDate !== null && data.effectiveDate) {
        return data.expiryDate > data.effectiveDate;
      }
      return true;
    },
    {
      message: 'Expiry date must be after the effective date',
      path: ['expiryDate'],
    },
  );

export interface UpdateTaxRateRequest {
  rate?: string;
  effectiveDate?: string;
  expiryDate?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface TaxRateResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  taxCodeId: string;
  rate: string;
  effectiveDate: string;
  expiryDate: string | null;
  description: string | null;
  isActive: boolean;
}

// ─── Tax Auto-Assignment Rule Types ─────────────────────────────────────────

export const CreateTaxAutoAssignmentRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required').max(100),
  description: z.string().optional(),
  priority: z.number().int().min(0).default(0),
  taxCodeId: UuidSchema,
  entityType: z.string().min(1, 'Entity type is required').max(50),
  entityCategoryId: UuidSchema.nullable().optional(),
  customerGroupId: UuidSchema.nullable().optional(),
  itemCategoryId: UuidSchema.nullable().optional(),
  regionCode: z.string().max(10).nullable().optional(),
  isActive: z.boolean().default(true),
});

export interface CreateTaxAutoAssignmentRuleRequest {
  name: string;
  description?: string;
  priority?: number;
  taxCodeId: string;
  entityType: string;
  entityCategoryId?: string | null;
  customerGroupId?: string | null;
  itemCategoryId?: string | null;
  regionCode?: string | null;
  isActive?: boolean;
}

export const UpdateTaxAutoAssignmentRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  priority: z.number().int().min(0).optional(),
  taxCodeId: UuidSchema.optional(),
  entityType: z.string().min(1).max(50).optional(),
  entityCategoryId: UuidSchema.nullable().optional(),
  customerGroupId: UuidSchema.nullable().optional(),
  itemCategoryId: UuidSchema.nullable().optional(),
  regionCode: z.string().max(10).nullable().optional(),
  isActive: z.boolean().optional(),
});

export interface UpdateTaxAutoAssignmentRuleRequest {
  name?: string;
  description?: string | null;
  priority?: number;
  taxCodeId?: string;
  entityType?: string;
  entityCategoryId?: string | null;
  customerGroupId?: string | null;
  itemCategoryId?: string | null;
  regionCode?: string | null;
  isActive?: boolean;
}

export interface TaxAutoAssignmentRuleResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  deletedAt: Date | null;
  name: string;
  description: string | null;
  priority: number;
  taxCodeId: string;
  entityType: string;
  entityCategoryId: string | null;
  customerGroupId: string | null;
  itemCategoryId: string | null;
  regionCode: string | null;
  isActive: boolean;
}

// ─── Tax Calculation Types ──────────────────────────────────────────────────

export const CalculateTaxSchema = z.object({
  taxCodeId: UuidSchema,
  taxableAmount: DecimalStringSchema,
  transactionDate: DateSchema,
});

export interface CalculateTaxRequest {
  taxCodeId: string;
  taxableAmount: string;
  transactionDate: string;
}

export interface TaxCalculationResult {
  taxCodeId: string;
  taxRateId: string;
  rate: string;
  taxableAmount: string;
  taxAmount: string;
  effectiveDate: string;
  expiryDate: string | null;
}

// ─── Auto-Assignment Types ──────────────────────────────────────────────────

export const ResolveAutoAssignmentSchema = z.object({
  entityType: z.string().min(1),
  entityCategoryId: UuidSchema.optional(),
  customerGroupId: UuidSchema.optional(),
  itemCategoryId: UuidSchema.optional(),
  regionCode: z.string().max(10).optional(),
  transactionDate: DateSchema,
});

export interface ResolveAutoAssignmentRequest {
  entityType: string;
  entityCategoryId?: string;
  customerGroupId?: string;
  itemCategoryId?: string;
  regionCode?: string;
  transactionDate: string;
}
