import * as budgetApi from '$lib/api/budget';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [budget, variance] = await Promise.all([
      budgetApi.getBudget(params.id),
      budgetApi.getBudgetVariance(params.id).catch(() => []),
    ]);
    return { budget, variance };
  } catch {
    return { budget: null, variance: [] };
  }
};
