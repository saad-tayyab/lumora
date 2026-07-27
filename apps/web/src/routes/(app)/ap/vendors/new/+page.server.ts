import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { vendorSchema } from '@lumora/validation';
import { apApi } from '$lib/api/ap';
import type { Actions } from './$types';

const formSchema = vendorSchema.extend({
	state: z.string().optional(),
	postalCode: z.string().optional(),
	currency: z.string().default('USD'),
});

export const load = async () => {
	const form = await superValidate(zod4(formSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const data = {
				name: form.data.name.trim(),
				email: form.data.email || undefined,
				phone: form.data.phone || undefined,
				address: form.data.address || undefined,
				city: form.data.city || undefined,
				state: form.data.state || undefined,
				postalCode: form.data.postalCode || undefined,
				country: form.data.country || 'US',
				taxId: form.data.taxId || undefined,
				paymentTerms: form.data.paymentTerms ? Number(form.data.paymentTerms) : 30,
				currency: form.data.currency,
				notes: form.data.notes || undefined,
			};

			await apApi.vendors.create(data);
			return redirect(303, '/ap/vendors');
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : 'Failed to create vendor';
			return fail(400, { form, error: errorMsg });
		}
	},
};
