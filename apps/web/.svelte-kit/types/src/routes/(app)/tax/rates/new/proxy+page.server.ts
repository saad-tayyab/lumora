// @ts-nocheck
import * as taxApi from '$lib/api/tax';
import type { PageServerLoad } from './$types';

export const load = async () => {
  try {
    const result = await taxApi.listTaxCodes({ limit: 100 });
    return { codes: result.data };
  } catch {
    return { codes: [] };
  }
};
;null as any as PageServerLoad;