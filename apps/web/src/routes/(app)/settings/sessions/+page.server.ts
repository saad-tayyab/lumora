import * as authApi from '$lib/api/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  try {
    const result = await authApi.listSessions({ page, limit: 20 });
    return { sessions: result.data, total: result.total, page };
  } catch {
    return { sessions: [], total: 0, page };
  }
};
