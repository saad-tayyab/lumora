import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { procApi } from '$lib/api/proc';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [report, poRes] = await Promise.all([
      procApi.receivingReports.get(params.id),
      procApi.purchaseOrders.list({ limit: 200 }),
    ]);
    return {
      report,
      purchaseOrders: poRes.data || [],
    };
  } catch {
    return { report: null, purchaseOrders: [] };
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();

    const body = {
      purchaseOrderId: formData.get('purchaseOrderId') as string,
      receivedDate: formData.get('receivedDate') as string,
      notes: (formData.get('notes') as string) || null,
    };

    if (!body.purchaseOrderId || !body.receivedDate) {
      return fail(400, { error: 'Purchase order and received date are required' });
    }

    try {
      await procApi.receivingReports.update(params.id, body);
    } catch (e: unknown) {
      const err = e as { message?: string };
      return fail(400, { error: err.message || 'Failed to update receiving report' });
    }

    redirect(303, `/proc/receiving-reports/${params.id}`);
  },
};
