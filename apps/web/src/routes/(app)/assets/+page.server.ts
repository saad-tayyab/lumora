import type { PageServerLoad } from './$types';
import { api, type PaginatedResponse } from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const [assets, entries, adjustments] = await Promise.allSettled([
      api.get<PaginatedResponse<any>>('/asset/fixed-assets?limit=1'),
      api.get<PaginatedResponse<any>>('/asset/depreciation-entries?limit=1'),
      api.get<PaginatedResponse<any>>('/asset/adjustments?limit=1'),
    ]);
    return {
      stats: {
        totalAssets: assets.status === 'fulfilled' ? assets.value.total || 0 : 0,
        draftEntries: entries.status === 'fulfilled' ? entries.value.total || 0 : 0,
        pendingAdjustments: adjustments.status === 'fulfilled' ? adjustments.value.total || 0 : 0,
      },
    };
  } catch {
    return { stats: { totalAssets: 0, draftEntries: 0, pendingAdjustments: 0 } };
  }
};
