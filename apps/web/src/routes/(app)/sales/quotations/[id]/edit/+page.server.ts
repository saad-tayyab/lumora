import { fail, redirect } from '@sveltejs/kit';
import { salesApi } from '$lib/api/sales';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const [quotation, lineItems] = await Promise.all([
			salesApi.quotations.get(params.id),
			salesApi.quotations.lineItems.list(params.id),
		]);
		return { quotation, lineItems };
	} catch {
		return { quotation: null, lineItems: [] };
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();

		const body = {
			customerId: formData.get('customerId') as string,
			quotationDate: formData.get('quotationDate') as string,
			validUntil: (formData.get('validUntil') as string) || null,
			notes: (formData.get('notes') as string) || null,
		};

		if (!body.customerId || !body.quotationDate) {
			return fail(400, { error: 'Customer and quotation date are required' });
		}

		try {
			await salesApi.quotations.update(params.id, body);
		} catch (e: unknown) {
			const err = e as { message?: string };
			return fail(400, { error: err.message || 'Failed to update quotation' });
		}

		redirect(303, `/sales/quotations/${params.id}`);
	},
};
