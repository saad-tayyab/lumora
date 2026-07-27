import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

const transferSchema = z.object({
	fromAccountId: z.string().min(1, 'Source account is required'),
	toAccountId: z.string().min(1, 'Destination account is required'),
	amount: z.number().positive('Amount must be positive'),
	transferDate: z.string().min(1, 'Transfer date is required'),
	reference: z.string().optional(),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, accountsResult] = await Promise.all([
		superValidate(zod4(transferSchema)),
		cashApi.bankAccounts.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return { form, accounts: accountsResult.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(transferSchema));
		if (!form.valid) return fail(400, { form });

		if (form.data.fromAccountId === form.data.toAccountId) {
			return fail(400, { form, error: 'Source and destination accounts must be different' });
		}

		try {
			await cashApi.transfers.create({
				fromAccountId: form.data.fromAccountId,
				toAccountId: form.data.toAccountId,
				amount: String(form.data.amount),
				transferDate: form.data.transferDate,
				reference: form.data.reference || undefined,
				notes: form.data.notes || undefined,
			});
			return message(form, 'Transfer created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create transfer';
			return fail(400, { form, error: msg });
		}
	},
};
