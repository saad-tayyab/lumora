// @ts-nocheck
import { hrApi } from '$lib/api/hr';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const employee = await hrApi.employees.get(params.id);
    return { employee };
  } catch {
    return { employee: null };
  }
};
