import { invApi } from '$lib/api/inv';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const categoryId = url.searchParams.get('categoryId') || undefined;

  try {
    const result = await invApi.items.list({ limit, offset, categoryId });
    return { items: result.data, total: result.total };
  } catch {
    return { items: [], total: 0 };
  }
};
