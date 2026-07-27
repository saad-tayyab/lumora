import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { hrApi } from '$lib/api/hr';
import type { Actions, PageServerLoad } from './$types';

const salarySchema = z.object({
	employeeId: z.string().min(1, 'Employee is required'),
	basicSalary: z.number().min(0, 'Salary must be non-negative'),
	allowances: z.number().min(0).default(0),
	deductions: z.number().min(0).default(0),
	effectiveFrom: z.string().min(1, 'Effective from date is required'),
	effectiveTo: z.string().optional(),
	isActive: z.boolean().default(true),
});

export const load: PageServerLoad = async () => {
	const [form, employeesResult] = await Promise.all([
		superValidate(zod4(salarySchema)),
		hrApi.employees.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return {
		form,
		employees: employeesResult.data,
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(salarySchema));
		if (!form.valid) return fail(400, { form });

		try {
			await hrApi.salaries.create({
				employeeId: form.data.employeeId,
				basicSalary: String(form.data.basicSalary),
				allowances: String(form.data.allowances),
				deductions: String(form.data.deductions),
				effectiveFrom: form.data.effectiveFrom,
				effectiveTo: form.data.effectiveTo || undefined,
				isActive: form.data.isActive,
			});
			return message(form, 'Salary record created successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to create salary record';
			return fail(400, { form, error: msg });
		}
	},
};
