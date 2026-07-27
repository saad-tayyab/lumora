import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { designationSchema } from '@lumora/validation';
import { hrApi } from '$lib/api/hr';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(designationSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(designationSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await hrApi.designations.create({
				title: form.data.name,
				code: form.data.name.toUpperCase().slice(0, 10),
				level: form.data.level ? Number(form.data.level) : 0,
			});
			return message(form, 'Designation created!');
		} catch {
			return fail(500, { form });
		}
	},
};
