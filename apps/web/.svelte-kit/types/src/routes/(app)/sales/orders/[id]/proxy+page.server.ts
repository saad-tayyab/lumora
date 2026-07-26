// @ts-nocheck
import { salesApi } from '$lib/api/sales';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const [order, lineItems] = await Promise.all([
      salesApi.orders.get(params.id),
      salesApi.orders.lineItems.list(params.id),
    ]);
    return { order, lineItems };
  } catch {
    return { order: null, lineItems: [] };
  }
};
