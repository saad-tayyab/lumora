import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

const warehouseSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	code: z.string().min(1, 'Code is required'),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(warehouseSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(warehouseSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await invApi.warehouses.create({
				name: form.data.name,
				code: form.data.code,
				address: form.data.address || undefined,
				city: form.data.city || undefined,
				country: form.data.country || undefined,
			});
			return message(form, 'Warehouse created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create warehouse';
			return fail(400, { form, error: msg });
		}
	},
};
