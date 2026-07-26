import * as taxApi from '$lib/api/tax';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 20;

  try {
    const result = await taxApi.listTaxCodes({ page, limit });
    return { codes: result.data, total: result.total, page, limit };
  } catch {
    return { codes: [], total: 0, page, limit };
  }
};
