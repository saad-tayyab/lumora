import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { invApi } from '$lib/api/inv';
import type { Actions, PageServerLoad } from './$types';

const itemSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	sku: z.string().min(1, 'SKU is required'),
	description: z.string().optional(),
	categoryId: z.string().optional(),
	unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
	costPrice: z.number().min(0, 'Cost price must be non-negative'),
	salePrice: z.number().min(0, 'Sale price must be non-negative'),
	reorderPoint: z.number().min(0).optional(),
});

export const load: PageServerLoad = async () => {
	const [form, categoriesResult] = await Promise.all([
		superValidate(zod4(itemSchema)),
		invApi.categories.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return { form, categories: categoriesResult.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(itemSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await invApi.items.create({
				name: form.data.name,
				sku: form.data.sku,
				description: form.data.description || undefined,
				categoryId: form.data.categoryId || undefined,
				unitOfMeasure: form.data.unitOfMeasure,
				costPrice: String(form.data.costPrice),
				salePrice: String(form.data.salePrice),
				reorderPoint: form.data.reorderPoint != null ? String(form.data.reorderPoint) : undefined,
			});
			return message(form, 'Item created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create item';
			return fail(400, { form, error: msg });
		}
	},
};
