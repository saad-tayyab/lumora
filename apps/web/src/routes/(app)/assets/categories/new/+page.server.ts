import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { assetCategorySchema } from '@lumora/validation';
import * as assetApi from '$lib/api/asset';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(assetCategorySchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(assetCategorySchema));
		if (!form.valid) return fail(400, { form });

		try {
			await assetApi.createAssetCategory({
				name: form.data.name,
				code: form.data.code,
				description: form.data.description || undefined,
				defaultDepreciationMethod: form.data.defaultDepreciationMethod,
				defaultUsefulLifeMonths: form.data.defaultUsefulLifeMonths,
				defaultSalvageValuePercent: String(form.data.defaultSalvageValuePercent),
				isDepreciable: form.data.isDepreciable,
			});
			return message(form, 'Category created!');
		} catch {
			return fail(500, { form });
		}
	},
};
