// @ts-nocheck
import * as assetApi from '$lib/api/asset';
import type { PageServerLoad } from './$types';

export const load = async () => {
  try {
    const result = await assetApi.listFixedAssets({ limit: 100 });
    return { assets: result.data };
  } catch {
    return { assets: [] };
  }
};
;null as any as PageServerLoad;