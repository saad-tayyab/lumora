import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { financialApi } from '$lib/api/financial';
import type { Actions, PageServerLoad } from './$types';

const journalEntryLineSchema = z.object({
	accountId: z.string().min(1, 'Account is required'),
	description: z.string().optional(),
	debit: z.number().min(0).optional(),
	credit: z.number().min(0).optional(),
});

const journalEntrySchema = z.object({
	date: z.string().min(1, 'Date is required'),
	description: z.string().min(1, 'Description is required'),
	lines: z.array(journalEntryLineSchema).min(2, 'At least 2 lines required'),
});

export const load: PageServerLoad = async () => {
	const [form, accountsResult] = await Promise.all([
		superValidate(zod4(journalEntrySchema)),
		financialApi.accounts.list().catch(() => ({ data: [] })),
	]);
	return { form, accounts: accountsResult.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(journalEntrySchema));
		if (!form.valid) return fail(400, { form });

		const totalDebit = form.data.lines.reduce((s, l) => s + (l.debit || 0), 0);
		const totalCredit = form.data.lines.reduce((s, l) => s + (l.credit || 0), 0);

		if (Math.abs(totalDebit - totalCredit) > 0.001) {
			return fail(400, { form, error: `Debits (${totalDebit.toFixed(2)}) must equal credits (${totalCredit.toFixed(2)})` });
		}

		try {
			await financialApi.journalEntries.create({
				date: form.data.date,
				description: form.data.description,
				lines: form.data.lines.map((l) => ({
					accountId: l.accountId,
					description: l.description || '',
					debit: String(l.debit || 0),
					credit: String(l.credit || 0),
				})),
			});
			return message(form, 'Journal entry created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create journal entry';
			return fail(400, { form, error: msg });
		}
	},
};
