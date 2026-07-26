import * as budgetApi from '$lib/api/budget';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const variance = await budgetApi.getBudgetVariance(params.id);
    return { variance, budgetId: params.id };
  } catch {
    return { variance: [], budgetId: params.id };
  }
};
