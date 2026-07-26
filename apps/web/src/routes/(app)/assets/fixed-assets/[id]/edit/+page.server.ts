import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [asset, categories] = await Promise.all([
      assetApi.getFixedAsset(params.id),
      assetApi.listAssetCategories({ limit: 100 }),
    ]);
    return { asset, categories: categories.data };
  } catch {
    return { asset: null, categories: [] };
  }
};
