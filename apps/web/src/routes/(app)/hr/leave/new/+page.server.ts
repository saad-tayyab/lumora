import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { hrApi } from '$lib/api/hr';
import type { Actions, PageServerLoad } from './$types';

const leaveRequestSchema = z.object({
	employeeId: z.string().min(1, 'Employee is required'),
	leaveTypeId: z.string().min(1, 'Leave type is required'),
	startDate: z.string().min(1, 'Start date is required'),
	endDate: z.string().min(1, 'End date is required'),
	totalDays: z.number().min(1, 'Total days must be at least 1'),
	reason: z.string().min(1, 'Reason is required'),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, employeesResult, leaveTypesResult] = await Promise.all([
		superValidate(zod4(leaveRequestSchema)),
		hrApi.employees.list({ limit: 100 }).catch(() => ({ data: [] })),
		hrApi.leaveTypes.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return {
		form,
		employees: employeesResult.data,
		leaveTypes: leaveTypesResult.data,
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(leaveRequestSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await hrApi.leaveRequests.create({
				employeeId: form.data.employeeId,
				leaveTypeId: form.data.leaveTypeId,
				startDate: form.data.startDate,
				endDate: form.data.endDate,
				totalDays: form.data.totalDays,
				reason: form.data.reason,
				notes: form.data.notes || undefined,
			});
			return message(form, 'Leave request submitted successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to submit leave request';
			return fail(400, { form, error: msg });
		}
	},
};
