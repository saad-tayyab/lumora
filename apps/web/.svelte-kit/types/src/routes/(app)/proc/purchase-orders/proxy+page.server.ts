// @ts-nocheck
import { procApi } from '$lib/api/proc';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const status = url.searchParams.get('status') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await procApi.purchaseOrders.list({ status, limit, offset });
    return { purchaseOrders: result.data, total: result.total, limit, offset };
  } catch {
    return { purchaseOrders: [], total: 0, limit, offset };
  }
};
