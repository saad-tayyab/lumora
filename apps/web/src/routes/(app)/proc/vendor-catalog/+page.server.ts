import { procApi } from '$lib/api/proc';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await procApi.vendorCatalog.list({ limit, offset });
    return { items: result.data, total: result.total, limit, offset };
  } catch {
    return { items: [], total: 0, limit, offset };
  }
};
