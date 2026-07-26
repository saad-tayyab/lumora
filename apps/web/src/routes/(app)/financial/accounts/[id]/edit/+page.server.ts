import { error } from '@sveltejs/kit';
import { financialApi } from '$lib/api/financial';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const account = await financialApi.accounts.get(params.id);
    return { account };
  } catch (e: any) {
    throw error(e.status || 500, e.message || 'Failed to load account');
  }
};
