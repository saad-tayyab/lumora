import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { procApi } from '$lib/api/proc';
import type { Actions, PageServerLoad } from './$types';

const receivingReportSchema = z.object({
	purchaseOrderId: z.string().min(1, 'Purchase order is required'),
	receivedDate: z.string().min(1, 'Received date is required'),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, poResult] = await Promise.all([
		superValidate(zod4(receivingReportSchema)),
		procApi.purchaseOrders.list({ status: 'approved', limit: 100 }).catch(() => ({ data: [] })),
	]);
	return { form, purchaseOrders: poResult.data };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(receivingReportSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await procApi.receivingReports.create({
				purchaseOrderId: form.data.purchaseOrderId,
				receivedDate: form.data.receivedDate,
				notes: form.data.notes || null,
			});
			return message(form, 'Receiving report created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create receiving report';
			return fail(400, { form, error: msg });
		}
	},
};
