import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { vendorPaymentSchema } from '@lumora/validation';
import { apApi } from '$lib/api/ap';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

const formSchema = vendorPaymentSchema.extend({
	billId: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, vendorsResult, billsResult, bankAccountsResult] = await Promise.all([
		superValidate(zod4(formSchema)),
		apApi.vendors.list({ limit: 100 }).catch(() => ({ data: [] })),
		apApi.bills.list({ limit: 100 }).catch(() => ({ data: [] })),
		cashApi.bankAccounts.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return {
		form,
		vendors: vendorsResult.data,
		bills: billsResult.data,
		bankAccounts: bankAccountsResult.data,
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(formSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const data = {
				vendorId: form.data.vendorId,
				billId: form.data.billId || undefined,
				amount: String(form.data.amount),
				paymentDate: form.data.paymentDate,
				paymentMethod: form.data.paymentMethod,
				reference: form.data.reference || undefined,
				bankAccountId: form.data.bankAccountId || undefined,
				notes: form.data.notes || undefined,
			};

			await apApi.payments.create(data);
			return redirect(303, '/ap/payments');
		} catch (e) {
			const errorMsg = e instanceof Error ? e.message : 'Failed to record payment';
			return fail(400, { form, error: errorMsg });
		}
	},
};
