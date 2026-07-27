import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { salesApi } from '$lib/api/sales';
import type { Actions, PageServerLoad } from './$types';

const discountPolicySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['percentage', 'fixed_amount', 'tiered']).default('percentage'),
	value: z.number().min(0, 'Value must be non-negative'),
	minQuantity: z.number().min(0).optional(),
	minAmount: z.number().min(0).optional(),
	maxDiscountAmount: z.number().min(0).optional(),
	startDate: z.string().min(1, 'Start date is required'),
	endDate: z.string().optional(),
	isActive: z.boolean().default(true),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(discountPolicySchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(discountPolicySchema));
		if (!form.valid) return fail(400, { form });

		try {
			await salesApi.discountPolicies.create({
				name: form.data.name,
				type: form.data.type,
				value: String(form.data.value),
				minQuantity: form.data.minQuantity != null ? String(form.data.minQuantity) : null,
				minAmount: form.data.minAmount != null ? String(form.data.minAmount) : null,
				maxDiscountAmount: form.data.maxDiscountAmount != null ? String(form.data.maxDiscountAmount) : null,
				startDate: form.data.startDate,
				endDate: form.data.endDate || null,
				isActive: form.data.isActive,
			});
			return message(form, 'Discount policy created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create discount policy';
			return fail(400, { form, error: msg });
		}
	},
};
