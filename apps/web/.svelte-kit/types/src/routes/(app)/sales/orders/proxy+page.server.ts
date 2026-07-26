// @ts-nocheck
import { salesApi } from '$lib/api/sales';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const status = url.searchParams.get('status') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await salesApi.orders.list({ status, limit, offset });
    return { orders: result.data, total: result.total, limit, offset };
  } catch {
    return { orders: [], total: 0, limit, offset };
  }
};
