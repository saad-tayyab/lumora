import { cashApi } from '$lib/api/cash';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const statement = await cashApi.statements.get(params.id);
    return { statement };
  } catch {
    return { statement: null };
  }
};
