import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { procApi } from '$lib/api/proc';
import type { Actions, PageServerLoad } from './$types';

const vendorCatalogSchema = z.object({
	vendorId: z.string().min(1, 'Vendor is required'),
	itemId: z.string().min(1, 'Item is required'),
	vendorSku: z.string().optional(),
	unitPrice: z.number().min(0, 'Price must be non-negative'),
	leadTimeDays: z.number().min(0).optional(),
	minimumOrderQuantity: z.number().min(0).optional(),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(vendorCatalogSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(vendorCatalogSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await procApi.vendorCatalog.create({
				vendorId: form.data.vendorId,
				itemId: form.data.itemId,
				vendorSku: form.data.vendorSku || null,
				unitPrice: String(form.data.unitPrice),
				leadTimeDays: form.data.leadTimeDays ?? null,
				minimumOrderQuantity: form.data.minimumOrderQuantity != null ? String(form.data.minimumOrderQuantity) : null,
				notes: form.data.notes || null,
			});
			return message(form, 'Catalog item created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create catalog item';
			return fail(400, { form, error: msg });
		}
	},
};
