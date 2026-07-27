import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { procApi } from '$lib/api/proc';
import type { Actions, PageServerLoad } from './$types';

const lineItemSchema = z.object({
	itemId: z.string().min(1, 'Item is required'),
	description: z.string().optional(),
	quantity: z.number().min(1, 'Quantity must be at least 1'),
	unitPrice: z.number().min(0, 'Price must be non-negative'),
});

const purchaseOrderSchema = z.object({
	vendorId: z.string().min(1, 'Vendor is required'),
	expectedDeliveryDate: z.string().optional(),
	notes: z.string().optional(),
	lineItems: z.array(lineItemSchema).min(1, 'At least one line item required'),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(purchaseOrderSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(purchaseOrderSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const po = await procApi.purchaseOrders.create({
				vendorId: form.data.vendorId,
				expectedDeliveryDate: form.data.expectedDeliveryDate || null,
				notes: form.data.notes || null,
			});

			for (const item of form.data.lineItems) {
				if (item.itemId) {
					await procApi.purchaseOrders.lineItems.create(po.id, {
						itemId: item.itemId,
						description: item.description || null,
						quantity: String(item.quantity),
						unitPrice: String(item.unitPrice),
					});
				}
			}

			return message(form, 'Purchase order created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create purchase order';
			return fail(400, { form, error: msg });
		}
	},
};
