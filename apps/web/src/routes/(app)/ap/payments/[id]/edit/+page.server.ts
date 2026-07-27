import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const [payment, vendorsResult, billsResult, bankAccountsResult] = await Promise.all([
			apApi.payments.get(params.id),
			apApi.vendors.list({ limit: 100 }),
			apApi.bills.list({ limit: 100 }),
			cashApi.bankAccounts.list({ limit: 100 }),
		]);
		return {
			payment,
			vendors: vendorsResult.data,
			bills: billsResult.data,
			bankAccounts: bankAccountsResult.data,
		};
	} catch {
		throw new Response('Payment not found', { status: 404 });
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();

		const data = {
			vendorId: formData.get('vendorId') as string,
			billId: (formData.get('billId') as string) || undefined,
			amount: formData.get('amount') as string,
			paymentDate: formData.get('paymentDate') as string,
			paymentMethod: formData.get('paymentMethod') as string,
			reference: (formData.get('reference') as string) || undefined,
			bankAccountId: (formData.get('bankAccountId') as string) || undefined,
			notes: (formData.get('notes') as string) || undefined,
		};

		if (!data.vendorId || !data.amount || !data.paymentDate || !data.paymentMethod) {
			return fail(400, { error: 'Vendor, amount, date, and method are required' });
		}

		try {
			await apApi.payments.create(data);
			return { success: true };
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to update payment';
			return fail(400, { error: msg });
		}
	},
};
