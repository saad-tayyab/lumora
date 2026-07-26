import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const vendor = await apApi.vendors.get(params.id);
    return { vendor };
  } catch {
    throw new Response('Vendor not found', { status: 404 });
  }
};

export const actions: Actions = {
  delete: async ({ params }) => {
    try {
      await apApi.vendors.delete(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete vendor';
      return fail(400, { error: message });
    }
  },
};
