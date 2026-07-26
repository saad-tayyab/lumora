import { salesApi } from '$lib/api/sales';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const status = url.searchParams.get('status') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await salesApi.quotations.list({ status, limit, offset });
    return { quotations: result.data, total: result.total, limit, offset };
  } catch {
    return { quotations: [], total: 0, limit, offset };
  }
};
