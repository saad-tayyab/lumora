import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fixedAssetSchema } from '@lumora/validation';
import * as assetApi from '$lib/api/asset';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(fixedAssetSchema));
	try {
		const result = await assetApi.listAssetCategories({ limit: 100 });
		return { form, categories: result.data };
	} catch {
		return { form, categories: [] };
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(fixedAssetSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await assetApi.createFixedAsset({
				name: form.data.name,
				assetNumber: form.data.code,
				description: form.data.notes || undefined,
				categoryId: form.data.categoryId,
				acquisitionDate: form.data.purchaseDate,
				acquisitionCost: String(form.data.purchasePrice),
				salvageValue: String(form.data.salvageValue),
				usefulLifeMonths: form.data.usefulLife,
				depreciationMethod: form.data.depreciationMethod,
			});
			return message(form, 'Fixed asset created!');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create fixed asset';
			return message(form, msg, { status: 400 });
		}
	},
};
