// @ts-nocheck
import { apApi } from '$lib/api/ap';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await apApi.payments.list({ limit, offset });
    return { payments: result.data, total: result.total };
  } catch {
    return { payments: [], total: 0 };
  }
};
