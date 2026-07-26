import { fail, redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/api';
import { financialApi } from '$lib/api/financial';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    if (!name || !startDate || !endDate) {
      return fail(400, {
        name,
        startDate,
        endDate,
        error: 'Name, start date, and end date are required',
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return fail(400, { name, startDate, endDate, error: 'End date must be after start date' });
    }

    try {
      await financialApi.fiscalYears.create({ name, startDate, endDate });
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : 'Failed to create fiscal year';
      return fail(e.status || 500, { name, startDate, endDate, error: message });
    }

    redirect(303, '/financial/fiscal-years');
  },
};
