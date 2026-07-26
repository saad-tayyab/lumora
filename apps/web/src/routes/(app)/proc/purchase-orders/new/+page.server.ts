import { procApi } from '$lib/api/proc';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [poRes, rrRes, vendorRes] = await Promise.all([
      procApi.purchaseOrders.list({ limit: 100 }),
      procApi.receivingReports.list({ limit: 100 }),
      procApi.vendorCatalog.list({ limit: 100 }),
    ]);
    return {
      purchaseOrders: poRes.data,
      receivingReports: rrRes.data,
      vendorItems: vendorRes.data,
    };
  } catch {
    return { purchaseOrders: [], receivingReports: [], vendorItems: [] };
  }
};
