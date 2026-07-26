import { error } from '@sveltejs/kit';
import { financialApi } from '$lib/api/financial';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const entry = await financialApi.journalEntries.get(params.id);
    return { entry };
  } catch (e: any) {
    throw error(e.status || 500, e.message || 'Failed to load journal entry');
  }
};
