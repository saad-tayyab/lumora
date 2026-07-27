import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { financialApi } from '$lib/api/financial';
import type { Actions, PageServerLoad } from './$types';

const fiscalYearSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	startDate: z.string().min(1, 'Start date is required'),
	endDate: z.string().min(1, 'End date is required'),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(fiscalYearSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(fiscalYearSchema));
		if (!form.valid) return fail(400, { form });

		if (new Date(form.data.startDate) >= new Date(form.data.endDate)) {
			return fail(400, { form, error: 'End date must be after start date' });
		}

		try {
			await financialApi.fiscalYears.create({
				name: form.data.name,
				startDate: form.data.startDate,
				endDate: form.data.endDate,
			});
			return message(form, 'Fiscal year created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create fiscal year';
			return fail(400, { form, error: msg });
		}
	},
};
