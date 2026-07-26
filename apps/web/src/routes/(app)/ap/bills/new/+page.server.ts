import { fail } from '@sveltejs/kit';
import { apApi } from '$lib/api/ap';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const vendors = await apApi.vendors.list({ limit: 100 });
    return { vendors: vendors.data };
  } catch {
    return { vendors: [] };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const lineItems: {
      description: string;
      quantity: string;
      unitPrice: string;
      amount: string;
    }[] = [];

    let i = 0;
    while (formData.has(`lineDescription_${i}`)) {
      const desc = formData.get(`lineDescription_${i}`) as string;
      if (desc) {
        lineItems.push({
          description: desc,
          quantity: (formData.get(`lineQuantity_${i}`) as string) || '1',
          unitPrice: (formData.get(`lineUnitPrice_${i}`) as string) || '0',
          amount: (formData.get(`lineAmount_${i}`) as string) || '0',
        });
      }
      i++;
    }

    const data = {
      vendorId: formData.get('vendorId') as string,
      billNumber: formData.get('billNumber') as string,
      issueDate: formData.get('issueDate') as string,
      dueDate: formData.get('dueDate') as string,
      subtotal: formData.get('subtotal') as string,
      taxAmount: (formData.get('taxAmount') as string) || '0',
      total: formData.get('total') as string,
      notes: (formData.get('notes') as string) || undefined,
      lineItems: lineItems.length > 0 ? lineItems : undefined,
    };

    if (!data.vendorId || !data.billNumber || !data.issueDate || !data.dueDate) {
      return fail(400, { error: 'Vendor, bill number, issue date, and due date are required' });
    }

    try {
      await apApi.bills.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create bill';
      return fail(400, { error: message });
    }
  },
};
