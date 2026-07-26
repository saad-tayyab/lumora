import { fail, redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/api';
import { financialApi } from '$lib/api/financial';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;

    if (!code || !name || !type) {
      return fail(400, {
        code,
        name,
        type,
        description,
        error: 'Code, name, and type are required',
      });
    }

    try {
      await financialApi.accounts.create({
        code,
        name,
        type: type as any,
        description: description || undefined,
      });
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : 'Failed to create account';
      return fail(e.status || 500, { code, name, type, description, error: message });
    }

    redirect(303, '/financial/accounts');
  },
};
