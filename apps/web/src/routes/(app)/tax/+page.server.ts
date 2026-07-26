import type { PageServerLoad } from './$types';
import { api, type PaginatedResponse } from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const [codes, rates, rules] = await Promise.allSettled([
      api.get<PaginatedResponse<any>>('/tax/codes?limit=1'),
      api.get<PaginatedResponse<any>>('/tax/rates?limit=1'),
      api.get<PaginatedResponse<any>>('/tax/auto-assignment-rules?limit=1'),
    ]);
    return {
      stats: {
        codes: codes.status === 'fulfilled' ? codes.value.total || 0 : 0,
        rates: rates.status === 'fulfilled' ? rates.value.total || 0 : 0,
        rules: rules.status === 'fulfilled' ? rules.value.total || 0 : 0,
      },
    };
  } catch {
    return { stats: { codes: 0, rates: 0, rules: 0 } };
  }
};
