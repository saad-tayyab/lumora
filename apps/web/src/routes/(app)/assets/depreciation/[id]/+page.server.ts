import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const schedule = await assetApi.getDepreciationSchedule(params.id);
    return { schedule };
  } catch {
    return { schedule: null };
  }
};
