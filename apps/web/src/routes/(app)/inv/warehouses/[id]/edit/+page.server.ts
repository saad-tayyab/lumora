import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invApi } from '$lib/api/inv';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const warehouse = await invApi.warehouses.get(params.id);
    return { warehouse };
  } catch {
    return { warehouse: null };
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();

    const body = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: (formData.get('address') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
    };

    if (!body.name || !body.code) {
      return fail(400, { error: 'Name and code are required' });
    }

    try {
      await invApi.warehouses.update(params.id, body);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return fail(400, { error: err.message || 'Failed to update warehouse' });
    }

    redirect(303, `/inv/warehouses/${params.id}`);
  },
};
