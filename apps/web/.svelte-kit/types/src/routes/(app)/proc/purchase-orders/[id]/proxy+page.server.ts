// @ts-nocheck
import { procApi } from '$lib/api/proc';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const [purchaseOrder, lineItems] = await Promise.all([
      procApi.purchaseOrders.get(params.id),
      procApi.purchaseOrders.lineItems.list(params.id),
    ]);
    return { purchaseOrder, lineItems };
  } catch {
    return { purchaseOrder: null, lineItems: [] };
  }
};
