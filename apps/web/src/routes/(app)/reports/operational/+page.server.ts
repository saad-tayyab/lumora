import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const [items, stockLevels] = await Promise.allSettled([
      api.get<{ data: any[]; total: number }>('/inv/items?limit=200'),
      api.get<{ data: any[]; total: number }>('/inv/stock-levels/list?limit=200'),
    ]);
    return {
      items: items.status === 'fulfilled' ? items.value.data || [] : ([] as any[]),
      stockLevels: stockLevels.status === 'fulfilled' ? stockLevels.value.data || [] : ([] as any[]),
    };
  } catch {
    return { items: [] as any[], stockLevels: [] as any[] };
  }
};
