import * as auditApi from '$lib/api/audit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const offset = Number(url.searchParams.get('offset')) || 0;
  const limit = 50;
  const userId = url.searchParams.get('userId') || undefined;
  const resource = url.searchParams.get('resource') || undefined;
  const action = url.searchParams.get('action') || undefined;
  const startDate = url.searchParams.get('startDate') || undefined;
  const endDate = url.searchParams.get('endDate') || undefined;

  try {
    const result = await auditApi.listAuditEntries({
      userId,
      resource,
      action,
      startDate,
      endDate,
      limit,
      offset,
    });
    return { entries: result.data, total: result.total, offset, limit };
  } catch {
    return { entries: [], total: 0, offset, limit };
  }
};
