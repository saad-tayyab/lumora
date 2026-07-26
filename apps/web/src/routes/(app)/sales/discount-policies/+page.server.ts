import { salesApi } from '$lib/api/sales';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await salesApi.discountPolicies.list({ limit, offset });
    return { policies: result.data, total: result.total, limit, offset };
  } catch {
    return { policies: [], total: 0, limit, offset };
  }
};
