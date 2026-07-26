import { procApi } from '$lib/api/proc';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const status = url.searchParams.get('status') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const result = await procApi.receivingReports.list({ status, limit, offset });
    return { reports: result.data, total: result.total, limit, offset };
  } catch {
    return { reports: [], total: 0, limit, offset };
  }
};
