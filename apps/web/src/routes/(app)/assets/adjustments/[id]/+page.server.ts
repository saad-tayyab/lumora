import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const adjustment = await assetApi.getAssetAdjustment(params.id);
    return { adjustment };
  } catch {
    return { adjustment: null };
  }
};
