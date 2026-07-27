import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { financialApi } from '$lib/api/financial';
import type { Actions, PageServerLoad } from './$types';

const accountSchema = z.object({
	code: z.string().min(1, 'Code is required'),
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
	description: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(accountSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(accountSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await financialApi.accounts.create({
				code: form.data.code,
				name: form.data.name,
				type: form.data.type,
				description: form.data.description || undefined,
			});
			return message(form, 'Account created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create account';
			return fail(400, { form, error: msg });
		}
	},
};
