import { cashApi } from '$lib/api/cash';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await cashApi.statements.list({ limit, offset });
    return { statements: result.data, total: result.total };
  } catch {
    return { statements: [], total: 0 };
  }
};
