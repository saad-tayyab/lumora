import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

const stockMovementSchema = z.object({
	itemId: z.string().min(1, 'Item is required'),
	warehouseId: z.string().min(1, 'Warehouse is required'),
	type: z.enum(['in', 'out', 'transfer', 'adjustment']),
	quantity: z.number().positive('Quantity must be positive'),
	referenceType: z.string().optional(),
	referenceId: z.string().optional(),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, itemsResult, warehousesResult] = await Promise.all([
		superValidate(zod4(stockMovementSchema)),
		invApi.items.list({ limit: 100 }).catch(() => ({ data: [] })),
		invApi.warehouses.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return { form, items: itemsResult.data, warehouses: warehousesResult.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(stockMovementSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await invApi.stockMovements.create({
				itemId: form.data.itemId,
				warehouseId: form.data.warehouseId,
				type: form.data.type,
				quantity: String(form.data.quantity),
				referenceType: form.data.referenceType || undefined,
				referenceId: form.data.referenceId || undefined,
				notes: form.data.notes || undefined,
			});
			return message(form, 'Stock movement recorded successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to record stock movement';
			return fail(400, { form, error: msg });
		}
	},
};
