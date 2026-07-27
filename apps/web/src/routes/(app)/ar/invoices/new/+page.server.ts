import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { invoiceSchema } from '@lumora/validation';
import { BACKEND_URL } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';

const formSchema = invoiceSchema.extend({
	invoiceNumber: z.string().min(1, 'Invoice number is required'),
	currency: z.string().default('USD'),
}).omit({ lineItems: true });

export const load: PageServerLoad = async () => {
	const [form, customersRes] = await Promise.all([
		superValidate(zod4(formSchema)),
		fetch(`${BACKEND_URL}/ar/customers?limit=100`, { credentials: 'include' })
			.then((r) => (r.ok ? r.json() : { data: [] }))
			.catch(() => ({ data: [] })),
	]);
	return { form, customers: customersRes.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		const lineItems: {
			description: string;
			quantity: string;
			unitPrice: string;
			taxRate?: string;
			sortOrder: number;
		}[] = [];
		let i = 0;
		while (formData.has(`lineDescription_${i}`)) {
			const description = formData.get(`lineDescription_${i}`) as string;
			const quantity = formData.get(`lineQuantity_${i}`) as string;
			const unitPrice = formData.get(`lineUnitPrice_${i}`) as string;
			const taxRate = formData.get(`lineTaxRate_${i}`) as string;
			if (description) {
				lineItems.push({
					description,
					quantity: quantity || '1',
					unitPrice: unitPrice || '0',
					taxRate: taxRate || undefined,
					sortOrder: i,
				});
			}
			i++;
		}

		if (lineItems.length === 0) {
			return fail(400, { form, error: 'At least one line item is required' });
		}

		try {
			const body = {
				customerId: form.data.customerId,
				invoiceNumber: form.data.invoiceNumber.trim(),
				issueDate: form.data.issueDate,
				dueDate: form.data.dueDate,
				currency: form.data.currency || 'USD',
				notes: form.data.notes || undefined,
				lineItems,
			};

			const res = await fetch(`${BACKEND_URL}/ar/invoices`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				credentials: 'include',
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: 'Failed to create invoice' }));
				return fail(400, { form, error: err.message || 'Failed to create invoice' });
			}

			const invoice = await res.json();
			return redirect(303, `/ar/invoices/${invoice.id}`);
		} catch {
			return fail(500, { form, error: 'Failed to connect to server' });
		}
	},
};
