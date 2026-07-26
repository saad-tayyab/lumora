// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const bill = await apApi.bills.get(params.id);
    return { bill };
  } catch {
    throw new Response('Bill not found', { status: 404 });
  }
};

export const actions = {
  submitForApproval: async ({ params }: import('./$types').RequestEvent) => {
    try {
      await apApi.bills.submitForApproval(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to submit bill';
      return fail(400, { error: message });
    }
  },

  approve: async ({ params }: import('./$types').RequestEvent) => {
    try {
      await apApi.bills.approve(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to approve bill';
      return fail(400, { error: message });
    }
  },

  void: async ({ params }: import('./$types').RequestEvent) => {
    try {
      await apApi.bills.void(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to void bill';
      return fail(400, { error: message });
    }
  },

  delete: async ({ params }: import('./$types').RequestEvent) => {
    try {
      await apApi.bills.delete(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete bill';
      return fail(400, { error: message });
    }
  },
};
;null as any as Actions;