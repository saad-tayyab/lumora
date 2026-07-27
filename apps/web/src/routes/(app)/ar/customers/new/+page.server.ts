import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { customerSchema } from '@lumora/validation';
import { api } from '$lib/api';
import type { Actions } from './$types';

const formSchema = customerSchema.extend({
	addressLine1: z.string().optional(),
	addressLine2: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
}).omit({ address: true, taxId: true, notes: true });

export const load = async () => {
	const form = await superValidate(zod4(formSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const body: Record<string, unknown> = {
				name: form.data.name.trim(),
				paymentTerms: form.data.paymentTerms || 'Net 30',
			};
			if (form.data.email) body.email = form.data.email.trim();
			if (form.data.phone) body.phone = form.data.phone.trim();
			if (form.data.addressLine1) body.addressLine1 = form.data.addressLine1.trim();
			if (form.data.addressLine2) body.addressLine2 = form.data.addressLine2.trim();
			if (form.data.city) body.city = form.data.city.trim();
			if (form.data.state) body.state = form.data.state.trim();
			if (form.data.postalCode) body.postalCode = form.data.postalCode.trim();
			if (form.data.country) body.country = form.data.country.trim().toUpperCase();
			if (form.data.creditLimit !== undefined && form.data.creditLimit !== null) {
				body.creditLimit = String(form.data.creditLimit);
			}

			const customer = await api.post<{ id: string }>('/ar/customers', body);
			return redirect(303, `/ar/customers/${customer.id}`);
		} catch {
			return fail(500, { form, error: 'Failed to connect to server' });
		}
	},
};
