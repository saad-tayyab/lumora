import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const limit = 20;

  try {
    const result = await assetApi.listFixedAssets({ page, limit });
    return { assets: result.data, total: result.total, page, limit };
  } catch {
    return { assets: [], total: 0, page, limit };
  }
};
