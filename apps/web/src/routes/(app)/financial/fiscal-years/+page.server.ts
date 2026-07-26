import { error } from '@sveltejs/kit';
import { financialApi } from '$lib/api/financial';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const response = await financialApi.fiscalYears.list();
    return { fiscalYears: response.data };
  } catch (e: any) {
    throw error(e.status || 500, e.message || 'Failed to load fiscal years');
  }
};
