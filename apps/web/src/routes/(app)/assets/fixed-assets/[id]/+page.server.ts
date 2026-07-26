import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const asset = await assetApi.getFixedAsset(params.id);
    return { asset };
  } catch {
    return { asset: null };
  }
};
