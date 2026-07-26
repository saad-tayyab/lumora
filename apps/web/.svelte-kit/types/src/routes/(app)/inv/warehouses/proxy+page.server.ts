// @ts-nocheck
import { invApi } from '$lib/api/inv';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await invApi.warehouses.list({ limit, offset });
    return { warehouses: result.data, total: result.total };
  } catch {
    return { warehouses: [], total: 0 };
  }
};
