import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

const bankAccountSchema = z.object({
	name: z.string().min(1, 'Account name is required'),
	accountNumber: z.string().min(1, 'Account number is required'),
	bankName: z.string().min(1, 'Bank name is required'),
	routingNumber: z.string().optional(),
	currency: z.string().default('USD'),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(bankAccountSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(bankAccountSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await cashApi.bankAccounts.create({
				name: form.data.name,
				accountNumber: form.data.accountNumber,
				bankName: form.data.bankName,
				routingNumber: form.data.routingNumber || undefined,
				currency: form.data.currency,
				notes: form.data.notes || undefined,
			});
			return message(form, 'Bank account created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create bank account';
			return fail(400, { form, error: msg });
		}
	},
};
