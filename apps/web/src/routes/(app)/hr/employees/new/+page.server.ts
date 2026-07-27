import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { employeeSchema } from '@lumora/validation';
import { hrApi } from '$lib/api/hr';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(employeeSchema));
	try {
		const [deptRes, desigRes] = await Promise.all([
			hrApi.departments.list({ limit: 100 }),
			hrApi.designations.list({ limit: 100 }),
		]);
		return { form, departments: deptRes.data, designations: desigRes.data };
	} catch {
		return { form, departments: [], designations: [] };
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(employeeSchema));
		if (!form.valid) return fail(400, { form });

		try {
			await hrApi.employees.create({
				firstName: form.data.firstName,
				lastName: form.data.lastName,
				email: form.data.email,
				phone: form.data.phone || undefined,
				departmentId: form.data.departmentId || undefined,
				designationId: form.data.designationId || undefined,
				employmentType: form.data.employmentType,
				joiningDate: form.data.dateOfJoining,
			});
			return message(form, 'Employee created!');
		} catch {
			return fail(500, { form });
		}
	},
};
