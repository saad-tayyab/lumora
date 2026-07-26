import * as budgetApi from '$lib/api/budget';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  try {
    const result = await budgetApi.listBudgets({ page, limit: 20 });
    return { budgets: result.data, total: result.total, page };
  } catch {
    return { budgets: [], total: 0, page };
  }
};
