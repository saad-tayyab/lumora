import { APIError, api } from 'encore.dev/api';
import { getAuthData } from 'encore.dev/internal/codegen/auth';
import { ValidationError } from '../../lib/errors';
import * as service from './service';
import type {
  AccountResponse,
  FiscalYearResponse,
  JournalEntryResponse,
  ListResponse,
} from './types';
import {
  CreateAccountRequest,
  CreateAccountSchema,
  CreateFiscalYearRequest,
  CreateFiscalYearSchema,
  CreateJournalEntryRequest,
  CreateJournalEntrySchema,
  PaginationParamsSchema,
  UpdateAccountRequest,
  UpdateAccountSchema,
  UpdateFiscalYearRequest,
  UpdateFiscalYearSchema,
  UpdateJournalEntryRequest,
  UpdateJournalEntrySchema,
} from './types';

function validate<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new ValidationError(error.message);
    }
    throw new ValidationError('Validation failed');
  }
}

export const createAccount = api(
  { expose: true, auth: true, method: 'POST', path: '/accounts' },
  async (req: CreateAccountRequest): Promise<AccountResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateAccountSchema, req);
    return service.createAccount(data, auth.tenantId);
  },
);

export const getAccount = api(
  { expose: true, auth: true, method: 'GET', path: '/accounts/:id' },
  async ({ id }: { id: string }): Promise<AccountResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getAccount(id, auth.tenantId);
  },
);

export const listAccounts = api(
  { expose: true, auth: true, method: 'GET', path: '/accounts' },
  async (req: {
    page?: number;
    limit?: number;
    type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  }): Promise<ListResponse<AccountResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listAccounts(auth.tenantId, { ...params, type: req.type });
  },
);

export const updateAccount = api(
  { expose: true, auth: true, method: 'PUT', path: '/accounts/:id' },
  async (req: { id: string } & UpdateAccountRequest): Promise<AccountResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateAccountSchema, body);
    return service.updateAccount(id, data, auth.tenantId);
  },
);

export const deleteAccount = api(
  { expose: true, auth: true, method: 'DELETE', path: '/accounts/:id' },
  async ({ id }: { id: string }): Promise<void> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.deleteAccount(id, auth.tenantId);
  },
);

export const createJournalEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/journal-entries' },
  async (req: CreateJournalEntryRequest): Promise<JournalEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateJournalEntrySchema, req);
    return service.createJournalEntry(data, auth.tenantId, auth.userId);
  },
);

export const getJournalEntry = api(
  { expose: true, auth: true, method: 'GET', path: '/journal-entries/:id' },
  async ({ id }: { id: string }): Promise<JournalEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getJournalEntry(id, auth.tenantId);
  },
);

export const listJournalEntries = api(
  { expose: true, auth: true, method: 'GET', path: '/journal-entries' },
  async (req: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'posted' | 'voided';
  }): Promise<ListResponse<JournalEntryResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listJournalEntries(auth.tenantId, {
      ...params,
      status: req.status,
    });
  },
);

export const updateJournalEntry = api(
  { expose: true, auth: true, method: 'PUT', path: '/journal-entries/:id' },
  async (req: { id: string } & UpdateJournalEntryRequest): Promise<JournalEntryResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateJournalEntrySchema, body);
    return service.updateJournalEntry(id, data, auth.tenantId);
  },
);

export const postJournalEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/journal-entries/:id/post' },
  async ({ id }: { id: string }): Promise<JournalEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.postJournalEntry(id, auth.tenantId, auth.userId);
  },
);

export const voidJournalEntry = api(
  { expose: true, auth: true, method: 'POST', path: '/journal-entries/:id/void' },
  async ({ id }: { id: string }): Promise<JournalEntryResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.voidJournalEntry(id, auth.tenantId);
  },
);

export const createFiscalYear = api(
  { expose: true, auth: true, method: 'POST', path: '/fiscal-years' },
  async (req: CreateFiscalYearRequest): Promise<FiscalYearResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(CreateFiscalYearSchema, req);
    return service.createFiscalYear(data, auth.tenantId);
  },
);

export const getFiscalYear = api(
  { expose: true, auth: true, method: 'GET', path: '/fiscal-years/:id' },
  async ({ id }: { id: string }): Promise<FiscalYearResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.getFiscalYear(id, auth.tenantId);
  },
);

export const listFiscalYears = api(
  { expose: true, auth: true, method: 'GET', path: '/fiscal-years' },
  async (req: { page?: number; limit?: number }): Promise<ListResponse<FiscalYearResponse>> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const params = validate(PaginationParamsSchema, req);
    return service.listFiscalYears(auth.tenantId, params);
  },
);

export const updateFiscalYear = api(
  { expose: true, auth: true, method: 'PUT', path: '/fiscal-years/:id' },
  async (req: { id: string } & UpdateFiscalYearRequest): Promise<FiscalYearResponse> => {
    const { id, ...body } = req;
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    const data = validate(UpdateFiscalYearSchema, body);
    return service.updateFiscalYear(id, data, auth.tenantId);
  },
);

export const closeFiscalYear = api(
  { expose: true, auth: true, method: 'POST', path: '/fiscal-years/:id/close' },
  async ({ id }: { id: string }): Promise<FiscalYearResponse> => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated('not authenticated');
    return service.closeFiscalYear(id, auth.tenantId);
  },
);
