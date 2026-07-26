import { procApi } from '$lib/api/proc';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const poRes = await procApi.purchaseOrders.list({ status: 'approved', limit: 100 });
    return { purchaseOrders: poRes.data };
  } catch {
    return { purchaseOrders: [] };
  }
};
