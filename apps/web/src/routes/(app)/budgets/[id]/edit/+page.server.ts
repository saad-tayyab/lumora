import * as budgetApi from '$lib/api/budget';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const budget = await budgetApi.getBudget(params.id);
    return { budget };
  } catch {
    return { budget: null };
  }
};
