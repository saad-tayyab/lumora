import { invApi } from '$lib/api/inv';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await invApi.categories.list({ limit, offset });
    return { categories: result.data, total: result.total };
  } catch {
    return { categories: [], total: 0 };
  }
};
