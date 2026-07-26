// @ts-nocheck
import { apApi } from '$lib/api/ap';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await apApi.vendors.list({ limit, offset });
    return { vendors: result.data, total: result.total };
  } catch {
    return { vendors: [], total: 0 };
  }
};
