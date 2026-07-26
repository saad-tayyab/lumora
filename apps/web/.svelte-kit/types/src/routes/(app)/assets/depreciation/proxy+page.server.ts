// @ts-nocheck
import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 20;

  try {
    const result = await assetApi.listDepreciationSchedules({ page, limit });
    return { schedules: result.data, total: result.total, page, limit };
  } catch {
    return { schedules: [], total: 0, page, limit };
  }
};
