import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const result = await assetApi.listAssetCategories({ limit: 100 });
    return { categories: result.data };
  } catch {
    return { categories: [] };
  }
};
