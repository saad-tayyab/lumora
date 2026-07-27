import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { autoAssignmentRuleSchema } from '@lumora/validation';
import * as taxApi from '$lib/api/tax';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(autoAssignmentRuleSchema));
	try {
		const result = await taxApi.listTaxCodes({ limit: 100 });
		return { form, codes: result.data };
	} catch {
		return { form, codes: [] };
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(autoAssignmentRuleSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await taxApi.createAutoAssignmentRule({
				name: form.data.name,
				description: form.data.description || undefined,
				priority: form.data.priority,
				taxCodeId: form.data.taxCodeId,
				entityType: form.data.entityType,
				regionCode: form.data.regionCode || null,
			});
			return message(form, 'Rule created!');
		} catch {
			return fail(500, { form });
		}
	},
};
