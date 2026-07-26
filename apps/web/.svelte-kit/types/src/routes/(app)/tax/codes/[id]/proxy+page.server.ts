// @ts-nocheck
import * as taxApi from '$lib/api/tax';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const code = await taxApi.getTaxCode(params.id);
    return { code };
  } catch {
    return { code: null };
  }
};
