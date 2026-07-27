import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { departmentSchema } from '@lumora/validation';
import { hrApi } from '$lib/api/hr';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(departmentSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(departmentSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await hrApi.departments.create({
				name: form.data.name,
				description: form.data.description || null,
				managerId: form.data.managerId || null,
			});
			return message(form, 'Department created!');
		} catch {
			return fail(500, { form });
		}
	},
};
