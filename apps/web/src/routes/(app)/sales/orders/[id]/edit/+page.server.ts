import { fail, redirect } from '@sveltejs/kit';
import { salesApi } from '$lib/api/sales';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const [order, lineItems] = await Promise.all([
			salesApi.orders.get(params.id),
			salesApi.orders.lineItems.list(params.id),
		]);
		return { order, lineItems };
	} catch {
		return { order: null, lineItems: [] };
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();

		const body = {
			customerId: formData.get('customerId') as string,
			orderDate: formData.get('orderDate') as string,
			expectedDeliveryDate: (formData.get('expectedDeliveryDate') as string) || null,
			notes: (formData.get('notes') as string) || null,
		};

		if (!body.customerId || !body.orderDate) {
			return fail(400, { error: 'Customer and order date are required' });
		}

		try {
			await salesApi.orders.update(params.id, body);
		} catch (e: unknown) {
			const err = e as { message?: string };
			return fail(400, { error: err.message || 'Failed to update order' });
		}

		redirect(303, `/sales/orders/${params.id}`);
	},
};
