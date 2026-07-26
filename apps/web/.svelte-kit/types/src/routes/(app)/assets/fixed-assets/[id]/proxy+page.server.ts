// @ts-nocheck
import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const asset = await assetApi.getFixedAsset(params.id);
    return { asset };
  } catch {
    return { asset: null };
  }
};
