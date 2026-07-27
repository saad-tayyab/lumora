import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { billSchema } from '@lumora/validation';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

const formSchema = billSchema.extend({
	billNumber: z.string().min(1, 'Bill number is required'),
	issueDate: z.string().min(1, 'Issue date is required'),
	subtotal: z.string().min(1, 'Subtotal is required'),
	taxAmount: z.string().default('0'),
	total: z.string().min(1, 'Total is required'),
}).omit({ billDate: true, reference: true });

export const load: PageServerLoad = async () => {
	const [form, vendorsRes] = await Promise.all([
		superValidate(zod4(formSchema)),
		apApi.vendors.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return { form, vendors: vendorsRes.data };
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
			amount: string;
		}[] = [];

		let i = 0;
		while (formData.has(`lineDescription_${i}`)) {
			const desc = formData.get(`lineDescription_${i}`) as string;
			if (desc) {
				lineItems.push({
					description: desc,
					quantity: (formData.get(`lineQuantity_${i}`) as string) || '1',
					unitPrice: (formData.get(`lineUnitPrice_${i}`) as string) || '0',
					amount: (formData.get(`lineAmount_${i}`) as string) || '0',
				});
			}
			i++;
		}

		try {
			const data = {
				vendorId: form.data.vendorId,
				billNumber: form.data.billNumber.trim(),
				issueDate: form.data.issueDate,
				dueDate: form.data.dueDate,
				subtotal: form.data.subtotal,
				taxAmount: form.data.taxAmount || '0',
				total: form.data.total,
				notes: form.data.notes || undefined,
				lineItems: lineItems.length > 0 ? lineItems : undefined,
			};

			await apApi.bills.create(data);
			return redirect(303, '/ap/bills');
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : 'Failed to create bill';
			return fail(400, { form, error: errorMsg });
		}
	},
};
