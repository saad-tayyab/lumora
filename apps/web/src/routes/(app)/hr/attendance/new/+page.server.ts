import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { hrApi } from '$lib/api/hr';
import type { Actions, PageServerLoad } from './$types';

const attendanceSchema = z.object({
	employeeId: z.string().min(1, 'Employee is required'),
	date: z.string().min(1, 'Date is required'),
	checkIn: z.string().optional(),
	checkOut: z.string().optional(),
	status: z.enum(['present', 'absent', 'half_day', 'late']),
	notes: z.string().optional(),
});

export const load: PageServerLoad = async () => {
	const [form, employeesResult] = await Promise.all([
		superValidate(zod4(attendanceSchema)),
		hrApi.employees.list({ limit: 100 }).catch(() => ({ data: [] })),
	]);
	return {
		form,
		employees: employeesResult.data,
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(attendanceSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await hrApi.attendance.create({
				employeeId: form.data.employeeId,
				date: form.data.date,
				clockIn: form.data.checkIn || undefined,
				clockOut: form.data.checkOut || undefined,
				status: form.data.status,
				notes: form.data.notes || undefined,
			});
			return message(form, 'Attendance recorded successfully');
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to record attendance';
			return fail(400, { form, error: msg });
		}
	},
};
