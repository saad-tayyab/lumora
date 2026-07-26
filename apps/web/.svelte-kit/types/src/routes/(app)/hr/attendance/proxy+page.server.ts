// @ts-nocheck
import { hrApi } from '$lib/api/hr';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  try {
    const result = await hrApi.attendance.list({ limit, offset });
    return { records: result.data, total: result.total };
  } catch {
    return { records: [], total: 0 };
  }
};
