import * as taxApi from '$lib/api/tax';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const code = await taxApi.getTaxCode(params.id);
    return { code };
  } catch {
    return { code: null };
  }
};
