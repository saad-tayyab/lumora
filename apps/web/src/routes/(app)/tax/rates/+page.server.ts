import * as taxApi from '$lib/api/tax';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  try {
    const [result, codes] = await Promise.all([
      taxApi.listTaxRates({ page, limit: 20 }),
      taxApi.listTaxCodes({ limit: 100 }),
    ]);
    return { rates: result.data, total: result.total, page, codes: codes.data };
  } catch {
    return { rates: [], total: 0, page, codes: [] };
  }
};
