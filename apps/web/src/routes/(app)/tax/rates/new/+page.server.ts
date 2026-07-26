import * as taxApi from '$lib/api/tax';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const result = await taxApi.listTaxCodes({ limit: 100 });
    return { codes: result.data };
  } catch {
    return { codes: [] };
  }
};
