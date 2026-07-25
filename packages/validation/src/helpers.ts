import { z } from 'zod';

export function dateRange() {
  return z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
      message: 'End date must be after start date',
    });
}

export function positiveAmount() {
  return z.number().positive('Amount must be positive');
}

export function nonEmptyArray<T extends z.ZodTypeAny>(schema: T) {
  return z.array(schema).min(1, 'At least one item required');
}

export function paginationSchema() {
  return z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  });
}

export function sortOrderSchema() {
  return z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).default('asc'),
  });
}
