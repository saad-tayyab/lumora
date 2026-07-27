import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

const statementSchema = z.object({
	bankAccountId: z.string().min(1, 'Bank account is required'),
	statementDate: z.string().min(1, 'Statement date is required'),
	openingBalance: z.number(),
	closingBalance: z.number(),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, accountsResult] = await Promise.all([
		superValidate(zod4(statementSchema)),
		cashApi.bankAccounts.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return {
		form,
		accounts: accountsResult.data,
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(statementSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await cashApi.statements.create({
				bankAccountId: form.data.bankAccountId,
				statementDate: form.data.statementDate,
				openingBalance: String(form.data.openingBalance),
				closingBalance: String(form.data.closingBalance),
				notes: form.data.notes || undefined,
			});
			return message(form, 'Statement created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create statement';
			return fail(400, { form, error: msg });
		}
	},
};
