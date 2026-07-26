// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const vendor = await apApi.vendors.get(params.id);
    return { vendor };
  } catch {
    throw new Response('Vendor not found', { status: 404 });
  }
};

export const actions = {
  delete: async ({ params }: import('./$types').RequestEvent) => {
    try {
      await apApi.vendors.delete(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete vendor';
      return fail(400, { error: message });
    }
  },
};
;null as any as Actions;