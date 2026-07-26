import * as authApi from '$lib/api/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  try {
    const result = await authApi.listRoles({ page, limit: 20 });
    return { roles: result.data, total: result.total, page };
  } catch {
    return { roles: [], total: 0, page };
  }
};
