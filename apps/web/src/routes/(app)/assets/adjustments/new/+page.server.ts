import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { listFixedAssets, createAssetAdjustment } from '$lib/api/asset';
import type { Actions, PageServerLoad } from './$types';

const adjustmentSchema = z.object({
	assetId: z.string().min(1, 'Asset is required'),
	adjustmentType: z.enum(['revaluation', 'impairment', 'restoration', 'transfer', 'reclassification']).default('revaluation'),
	adjustmentDate: z.string().min(1, 'Date is required'),
	adjustmentAmount: z.number().positive('Amount must be positive'),
	direction: z.enum(['increase', 'decrease']).default('increase'),
	description: z.string().min(1, 'Description is required'),
	revisedUsefulLifeMonths: z.number().min(0).optional(),
	revisedSalvageValue: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, assetsResult] = await Promise.all([
		superValidate(zod4(adjustmentSchema)),
		listFixedAssets({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return { form, assets: assetsResult.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(adjustmentSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await createAssetAdjustment({
				assetId: form.data.assetId,
				adjustmentType: form.data.adjustmentType,
				adjustmentDate: form.data.adjustmentDate,
				adjustmentAmount: String(form.data.adjustmentAmount),
				direction: form.data.direction,
				description: form.data.description,
				revisedUsefulLifeMonths: form.data.revisedUsefulLifeMonths,
				revisedSalvageValue: form.data.revisedSalvageValue || undefined,
			});
			return message(form, 'Adjustment created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create adjustment';
			return fail(400, { form, error: msg });
		}
	},
};
