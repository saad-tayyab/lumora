import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { taxCodeSchema } from '@lumora/validation';
import * as taxApi from '$lib/api/tax';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(taxCodeSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(taxCodeSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await taxApi.createTaxCode({
				code: form.data.code,
				name: form.data.name,
				type: form.data.type,
				glAccountId: form.data.glAccountId || '',
				postingRule: form.data.postingRule,
				isClaimable: form.data.isClaimable,
				isActive: form.data.isActive,
				description: form.data.description || undefined,
			});
			return message(form, 'Tax code created!');
		} catch {
			return fail(500, { form });
		}
	},
};
