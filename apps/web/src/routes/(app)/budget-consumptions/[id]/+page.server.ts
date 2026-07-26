import * as budgetApi from '$lib/api/budget';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const consumption = await budgetApi.getBudgetConsumption(params.id);
    return { consumption };
  } catch {
    return { consumption: null };
  }
};
