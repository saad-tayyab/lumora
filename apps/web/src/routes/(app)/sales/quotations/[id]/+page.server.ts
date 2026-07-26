import { salesApi } from '$lib/api/sales';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [quotation, lineItems] = await Promise.all([
      salesApi.quotations.get(params.id),
      salesApi.quotations.lineItems.list(params.id),
    ]);
    return { quotation, lineItems };
  } catch {
    return { quotation: null, lineItems: [] };
  }
};
