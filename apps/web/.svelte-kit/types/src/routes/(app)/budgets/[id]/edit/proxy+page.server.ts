// @ts-nocheck
import * as budgetApi from '$lib/api/budget';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const budget = await budgetApi.getBudget(params.id);
    return { budget };
  } catch {
    return { budget: null };
  }
};
