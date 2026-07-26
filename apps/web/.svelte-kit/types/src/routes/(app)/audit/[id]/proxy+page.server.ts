// @ts-nocheck
import * as auditApi from '$lib/api/audit';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const entry = await auditApi.getAuditEntry(params.id);
    return { entry };
  } catch {
    return { entry: null };
  }
};
