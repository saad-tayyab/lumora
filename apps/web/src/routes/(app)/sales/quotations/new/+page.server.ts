import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { salesApi } from '$lib/api/sales';
import type { Actions, PageServerLoad } from './$types';

const lineItemSchema = z.object({
	itemId: z.string().min(1, 'Item is required'),
	description: z.string().optional(),
	quantity: z.number().min(1, 'Quantity must be at least 1'),
	unitPrice: z.number().min(0, 'Price must be non-negative'),
	discount: z.number().min(0).default(0),
});

const quotationSchema = z.object({
	customerId: z.string().min(1, 'Customer is required'),
	validUntil: z.string().optional(),
	notes: z.string().optional(),
	lineItems: z.array(lineItemSchema).min(1, 'At least one line item required'),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(quotationSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(quotationSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const quotation = await salesApi.quotations.create({
				customerId: form.data.customerId,
				validUntil: form.data.validUntil || null,
				notes: form.data.notes || null,
			});

			for (const item of form.data.lineItems) {
				if (item.itemId) {
					await salesApi.quotations.lineItems.create(quotation.id, {
						itemId: item.itemId,
						description: item.description || null,
						quantity: String(item.quantity),
						unitPrice: String(item.unitPrice),
						discount: String(item.discount),
					});
				}
			}

			return message(form, 'Quotation created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create quotation';
			return fail(400, { form, error: msg });
		}
	},
};
