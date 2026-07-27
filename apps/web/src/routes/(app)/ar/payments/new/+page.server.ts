import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { paymentSchema } from '@lumora/validation';
import { api } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';

const formSchema = paymentSchema.extend({
	paymentNumber: z.string().min(1, 'Payment number is required'),
	currency: z.string().default('USD'),
}).omit({ reference: true }).extend({
	referenceNumber: z.string().optional(),
});

export const load: PageServerLoad = async ({ url }) => {
	const customerId = url.searchParams.get('customerId') || undefined;
	const [form, customersRes] = await Promise.all([
		superValidate(zod4(formSchema)),
		api.get<{ data: unknown[] }>('/ar/customers?limit=100').catch(() => ({ data: [] })),
	]);
	return { form, customers: customersRes.data, preselectedCustomerId: customerId };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const body: Record<string, unknown> = {
				customerId: form.data.customerId,
				paymentNumber: form.data.paymentNumber.trim(),
				paymentDate: form.data.paymentDate,
				amount: String(form.data.amount),
				paymentMethod: form.data.paymentMethod,
				currency: form.data.currency || 'USD',
			};
			if (form.data.referenceNumber) body.referenceNumber = form.data.referenceNumber.trim();
			if (form.data.notes) body.notes = form.data.notes.trim();

			await api.post('/ar/payments', body);
			return redirect(303, '/ar/payments');
		} catch {
			return fail(500, { form, error: 'Failed to connect to server' });
		}
	},
};
