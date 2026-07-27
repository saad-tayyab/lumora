import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

const categorySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(categorySchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(categorySchema));
		if (!form.valid) return fail(400, { form });

		try {
			await invApi.categories.create({
				name: form.data.name,
				description: form.data.description || undefined,
			});
			return message(form, 'Category created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create category';
			return fail(400, { form, error: msg });
		}
	},
};
