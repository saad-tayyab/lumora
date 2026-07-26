// @ts-nocheck
import { error } from '@sveltejs/kit';
import { financialApi } from '$lib/api/financial';
import type { PageServerLoad } from './$types';

export const load = async () => {
  try {
    const response = await financialApi.journalEntries.list();
    return { entries: response.data };
  } catch (e: any) {
    throw error(e.status || 500, e.message || 'Failed to load journal entries');
  }
};
;null as any as PageServerLoad;