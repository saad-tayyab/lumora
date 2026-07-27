import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { hrApi } from '$lib/api/hr';
import type { Actions, PageServerLoad } from './$types';

const payrollSchema = z.object({
	period: z.string().min(1, 'Period is required'),
	status: z.enum(['draft', 'processed', 'paid', 'cancelled']).default('draft'),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(payrollSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(payrollSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await hrApi.payroll.create({
				period: form.data.period,
				status: form.data.status,
			});
			return message(form, 'Payroll created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create payroll';
			return fail(400, { form, error: msg });
		}
	},
};
