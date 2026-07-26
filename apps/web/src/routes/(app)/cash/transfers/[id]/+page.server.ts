import { cashApi } from '$lib/api/cash';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const transfer = await cashApi.transfers.get(params.id);
    return { transfer };
  } catch {
    return { transfer: null };
  }
};
