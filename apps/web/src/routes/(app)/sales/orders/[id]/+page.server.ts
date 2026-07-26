import { salesApi } from '$lib/api/sales';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
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
