import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { userSchema } from '@lumora/validation';
import { createUser } from '$lib/api/auth';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(userSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(userSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await createUser({
				name: form.data.name,
				email: form.data.email,
				username: form.data.username || form.data.name.toLowerCase().replace(/\s+/g, '.'),
			});
			return message(form, 'User created!');
		} catch {
			return fail(500, { form });
		}
	},
};
