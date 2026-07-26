// @ts-nocheck
import { apApi } from '$lib/api/ap';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const status = url.searchParams.get('status') || undefined;

  try {
    const result = await apApi.bills.list({ limit, offset, status });
    return { bills: result.data, total: result.total, statusFilter: status || '' };
  } catch {
    return { bills: [], total: 0, statusFilter: status || '' };
  }
};
