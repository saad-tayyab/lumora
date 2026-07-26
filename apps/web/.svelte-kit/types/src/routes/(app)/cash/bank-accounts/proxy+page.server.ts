// @ts-nocheck
import { cashApi } from '$lib/api/cash';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await cashApi.bankAccounts.list({ limit, offset });
    return { accounts: result.data, total: result.total };
  } catch {
    return { accounts: [], total: 0 };
  }
};
