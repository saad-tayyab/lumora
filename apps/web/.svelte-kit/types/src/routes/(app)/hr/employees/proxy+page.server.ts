// @ts-nocheck
import { hrApi } from '$lib/api/hr';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const status = url.searchParams.get('status') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await hrApi.employees.list({ status, limit, offset });
    return { employees: result.data, total: result.total, limit, offset };
  } catch {
    return { employees: [], total: 0, limit, offset };
  }
};
