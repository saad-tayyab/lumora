import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const category = await assetApi.getAssetCategory(params.id);
    return { category };
  } catch {
    return { category: null };
  }
};
