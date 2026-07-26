import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [employee, departments, designations] = await Promise.all([
      api.get<any>(`/hr/employees/${params.id}`),
      api.get<{ data: any[] }>('/hr/departments?limit=200'),
      api.get<{ data: any[] }>('/hr/designations?limit=200'),
    ]);
    return {
      employee,
      departments: departments.data || [],
      designations: designations.data || [],
    };
  } catch {
    return { employee: null, departments: [], designations: [] };
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const body = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || null,
      departmentId: formData.get('departmentId') as string,
      designationId: formData.get('designationId') as string,
      joiningDate: formData.get('joiningDate') as string,
      employmentType: formData.get('employmentType') as string,
      status: formData.get('status') as string,
    };

    if (!body.firstName || !body.lastName || !body.email || !body.departmentId || !body.designationId || !body.joiningDate) {
      return fail(400, { error: 'All required fields must be filled' });
    }

    try {
      await api.patch(`/hr/employees/${params.id}`, body);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return fail(400, { error: err.message || 'Failed to update employee' });
    }

    redirect(303, `/hr/employees/${params.id}`);
  },
};
