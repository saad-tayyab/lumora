import { hrApi } from '$lib/api/hr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const employee = await hrApi.employees.get(params.id);
    return { employee };
  } catch {
    return { employee: null };
  }
};
