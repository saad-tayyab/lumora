// @ts-nocheck
import * as authApi from '$lib/api/auth';
import type { PageServerLoad } from './$types';

export const load = async ({ url }: Parameters<PageServerLoad>[0]) => {
  const page = Number(url.searchParams.get('page')) || 1;
  try {
    const result = await authApi.listUsers({ page, limit: 20 });
    return { users: result.data, total: result.total, page };
  } catch {
    return { users: [], total: 0, page };
  }
};
