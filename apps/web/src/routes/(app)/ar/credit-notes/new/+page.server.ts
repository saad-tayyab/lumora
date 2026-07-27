import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { creditNoteSchema } from '@lumora/validation';
import { api } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';

const formSchema = creditNoteSchema.extend({
	creditNoteNumber: z.string().min(1, 'Credit note number is required'),
	issueDate: z.string().min(1, 'Issue date is required'),
	currency: z.string().default('USD'),
}).omit({ invoiceId: true });

export const load: PageServerLoad = async () => {
	const [form, customersRes] = await Promise.all([
		superValidate(zod4(formSchema)),
		api.get<{ data: unknown[] }>('/ar/customers?limit=100').catch(() => ({ data: [] })),
	]);
	return { form, customers: customersRes.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const body: Record<string, unknown> = {
				customerId: form.data.customerId,
				creditNoteNumber: form.data.creditNoteNumber.trim(),
				issueDate: form.data.issueDate,
				amount: String(form.data.amount),
				reason: form.data.reason.trim(),
				currency: form.data.currency || 'USD',
			};
			if (form.data.notes) body.notes = form.data.notes.trim();

			const creditNote = await api.post<{ id: string }>('/ar/credit-notes', body);
			return redirect(303, `/ar/credit-notes/${creditNote.id}`);
		} catch {
			return fail(500, { form, error: 'Failed to connect to server' });
		}
	},
};
