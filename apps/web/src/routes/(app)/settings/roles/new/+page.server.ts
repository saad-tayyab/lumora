import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { roleSchema } from '@lumora/validation';
import { createRole } from '$lib/api/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(roleSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(roleSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await createRole({
				name: form.data.name,
				description: form.data.description || undefined,
			});
			return message(form, 'Role created!');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create role';
			return message(form, msg, { status: 400 });
		}
	},
};
