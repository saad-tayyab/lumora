import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getRole, updateRole } from '$lib/api/auth';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const role = await getRole(params.id);
    return { role };
  } catch {
    return { role: null };
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();

    const body = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
    };

    if (!body.name) {
      return fail(400, { error: 'Role name is required' });
    }

    try {
      await updateRole(params.id, body);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return fail(400, { error: err.message || 'Failed to update role' });
    }

    redirect(303, `/settings/roles/${params.id}`);
  },
};
