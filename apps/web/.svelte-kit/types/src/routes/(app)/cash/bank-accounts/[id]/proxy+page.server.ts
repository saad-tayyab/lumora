// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const account = await cashApi.bankAccounts.get(params.id);
    return { account };
  } catch {
    throw new Response('Bank account not found', { status: 404 });
  }
};

export const actions = {
  delete: async ({ params }: import('./$types').RequestEvent) => {
    try {
      await cashApi.bankAccounts.delete(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete bank account';
      return fail(400, { error: message });
    }
  },
};
;null as any as Actions;