import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { taxRateSchema } from '@lumora/validation';
import * as taxApi from '$lib/api/tax';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(taxRateSchema));
	try {
		const result = await taxApi.listTaxCodes({ limit: 100 });
		return { form, codes: result.data };
	} catch {
		return { form, codes: [] };
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(taxRateSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await taxApi.createTaxRate({
				taxCodeId: form.data.taxCodeId,
				rate: String(form.data.rate),
				effectiveDate: form.data.effectiveDate,
				expiryDate: form.data.expiryDate || null,
			});
			return message(form, 'Tax rate created!');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create tax rate';
			return message(form, msg, { status: 400 });
		}
	},
};
