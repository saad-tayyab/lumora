import * as auditApi from '$lib/api/audit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const entry = await auditApi.getAuditEntry(params.id);
    return { entry };
  } catch {
    return { entry: null };
  }
};
