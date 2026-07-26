// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { invApi } from '$lib/api/inv';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request }: import('./$types').RequestEvent) => {
    const formData = await request.formData();

    const data = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
    };

    if (!data.name) {
      return fail(400, { error: 'Name is required' });
    }

    try {
      await invApi.categories.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create category';
      return fail(400, { error: message });
    }
  },
};
;null as any as Actions;