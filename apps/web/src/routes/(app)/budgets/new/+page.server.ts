import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { createBudget } from '$lib/api/budget';
import type { Actions, PageServerLoad } from './$types';

const budgetSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	periodStart: z.string().min(1, 'Period start is required'),
	periodEnd: z.string().min(1, 'Period end is required'),
	totalAmount: z.number().min(0, 'Total must be non-negative'),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(budgetSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(budgetSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await createBudget({
				name: form.data.name,
				description: form.data.description || undefined,
				periodStart: form.data.periodStart,
				periodEnd: form.data.periodEnd,
				totalAmount: String(form.data.totalAmount),
			});
			return message(form, 'Budget created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create budget';
			return fail(400, { form, error: msg });
		}
	},
};
