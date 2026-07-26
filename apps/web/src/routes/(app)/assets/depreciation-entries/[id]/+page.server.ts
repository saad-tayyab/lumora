import * as assetApi from '$lib/api/asset';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const entry = await assetApi.getDepreciationEntry(params.id);
    return { entry };
  } catch {
    return { entry: null };
  }
};

export const actions: Actions = {
  post: async ({ params }) => {
    try {
      const journalEntryId = crypto.randomUUID();
      await assetApi.postDepreciationEntry(params.id, { journalEntryId });
    } catch {
      return fail(500, { error: 'Failed to post entry' });
    }
    throw redirect(303, `/assets/depreciation-entries/${params.id}`);
  },

  void: async ({ params }) => {
    try {
      await assetApi.voidDepreciationEntry(params.id);
    } catch {
      return fail(500, { error: 'Failed to void entry' });
    }
    throw redirect(303, `/assets/depreciation-entries/${params.id}`);
  },
};
