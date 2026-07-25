import type { Account, FiscalYear, JournalEntry, JournalEntryLine } from '@lumora/database/schema';
import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────────────────

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

// ─── Account Types ──────────────────────────────────────────────────────────

export const CreateAccountSchema = z.object({
  code: z.string().min(1, 'Account code is required').max(20),
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  parentId: UuidSchema.optional(),
  isActive: z.boolean().default(true),
});

export type CreateAccountRequest = z.infer<typeof CreateAccountSchema>;

export const UpdateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
  parentId: UuidSchema.nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAccountRequest = z.infer<typeof UpdateAccountSchema>;

export type AccountResponse = Account;

// ─── Journal Entry Types ────────────────────────────────────────────────────

export const JournalEntryLineInputSchema = z
  .object({
    accountId: UuidSchema,
    debit: DecimalStringSchema.default('0'),
    credit: DecimalStringSchema.default('0'),
    description: z.string().optional(),
  })
  .refine(
    (line) => {
      const hasDebit = line.debit !== '0' && line.debit !== '';
      const hasCredit = line.credit !== '0' && line.credit !== '';
      return hasDebit !== hasCredit;
    },
    {
      message: 'Each line must have a non-zero debit or credit amount, but not both',
    },
  );

export type JournalEntryLineInput = z.infer<typeof JournalEntryLineInputSchema>;

export const CreateJournalEntrySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    description: z.string().min(1, 'Description is required'),
    referenceNumber: z.string().max(50).optional(),
    lines: z.array(JournalEntryLineInputSchema).min(2, 'Journal entry requires at least two lines'),
  })
  .refine(
    (data) => {
      const totalDebits = data.lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const totalCredits = data.lines.reduce((sum, line) => sum + Number(line.credit), 0);
      return totalDebits === totalCredits;
    },
    {
      message: 'Total debits must equal total credits',
      path: ['lines'],
    },
  );

export type CreateJournalEntryRequest = z.infer<typeof CreateJournalEntrySchema>;

export const UpdateJournalEntrySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .optional(),
    description: z.string().min(1).optional(),
    referenceNumber: z.string().max(50).nullable().optional(),
    lines: z.array(JournalEntryLineInputSchema).min(2).optional(),
  })
  .refine(
    (data) => {
      if (!data.lines) return true;
      const totalDebits = data.lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const totalCredits = data.lines.reduce((sum, line) => sum + Number(line.credit), 0);
      return totalDebits === totalCredits;
    },
    {
      message: 'Total debits must equal total credits',
      path: ['lines'],
    },
  );

export type UpdateJournalEntryRequest = z.infer<typeof UpdateJournalEntrySchema>;

export interface JournalEntryResponse extends JournalEntry {
  lines: JournalEntryLine[];
}

// ─── Fiscal Year Types ─────────────────────────────────────────────────────

export const CreateFiscalYearSchema = z
  .object({
    name: z.string().min(1, 'Fiscal year name is required').max(100),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'End date must be after start date',
  });

export type CreateFiscalYearRequest = z.infer<typeof CreateFiscalYearSchema>;

export const UpdateFiscalYearSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['open', 'closed']).optional(),
});

export type UpdateFiscalYearRequest = z.infer<typeof UpdateFiscalYearSchema>;

export type FiscalYearResponse = FiscalYear;
