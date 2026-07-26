import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const item = await invApi.items.get(params.id);
    return { item };
  } catch {
    throw new Response('Item not found', { status: 404 });
  }
};

export const actions: Actions = {
  delete: async ({ params }) => {
    try {
      await invApi.items.delete(params.id);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete item';
      return fail(400, { error: message });
    }
  },
};
