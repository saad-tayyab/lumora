import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: (formData.get('address') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
    };

    if (!data.name || !data.code) {
      return fail(400, { error: 'Name and code are required' });
    }

    try {
      await invApi.warehouses.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create warehouse';
      return fail(400, { error: message });
    }
  },
};
