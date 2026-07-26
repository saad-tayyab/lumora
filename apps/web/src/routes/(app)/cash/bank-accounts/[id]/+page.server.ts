import { fail } from '@sveltejs/kit';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const account = await cashApi.bankAccounts.get(params.id);
    return { account };
  } catch {
    throw new Response('Bank account not found', { status: 404 });
  }
};

export const actions: Actions = {
  delete: async ({ params }) => {
    try {
      await cashApi.bankAccounts.delete(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete bank account';
      return fail(400, { error: message });
    }
  },
};
