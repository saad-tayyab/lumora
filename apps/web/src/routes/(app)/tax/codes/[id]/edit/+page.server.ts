import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getTaxCode, updateTaxCode } from '$lib/api/tax';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const taxCode = await getTaxCode(params.id);
    return { taxCode };
  } catch {
    return { taxCode: null };
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();

    const body = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      glAccountId: formData.get('glAccountId') as string,
      postingRule: formData.get('postingRule') as string,
      isClaimable: formData.get('isClaimable') === 'on',
      description: (formData.get('description') as string) || null,
    };

    if (!body.name || !body.type || !body.glAccountId) {
      return fail(400, { error: 'Name, type, and GL account are required' });
    }

    try {
      await updateTaxCode(params.id, body);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return fail(400, { error: err.message || 'Failed to update tax code' });
    }

    redirect(303, `/tax/codes/${params.id}`);
  },
};
