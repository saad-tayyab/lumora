// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
  try {
    const [bill, vendorsResult] = await Promise.all([
      apApi.bills.get(params.id),
      apApi.vendors.list({ limit: 100 }),
    ]);
    return { bill, vendors: vendorsResult.data };
  } catch {
    throw new Response('Bill not found', { status: 404 });
  }
};

export const actions = {
  default: async ({ request, params }: import('./$types').RequestEvent) => {
    const formData = await request.formData();

    const data = {
      vendorId: formData.get('vendorId') as string,
      billNumber: formData.get('billNumber') as string,
      issueDate: formData.get('issueDate') as string,
      dueDate: formData.get('dueDate') as string,
      subtotal: formData.get('subtotal') as string,
      taxAmount: (formData.get('taxAmount') as string) || '0',
      total: formData.get('total') as string,
      notes: (formData.get('notes') as string) || undefined,
    };

    if (!data.vendorId || !data.billNumber || !data.issueDate || !data.dueDate) {
      return fail(400, { error: 'Vendor, bill number, issue date, and due date are required' });
    }

    try {
      await apApi.bills.update(params.id, data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update bill';
      return fail(400, { error: message });
    }
  },
};
;null as any as Actions;