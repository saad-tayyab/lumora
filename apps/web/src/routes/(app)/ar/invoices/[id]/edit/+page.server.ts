import { fail, redirect } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [invoice, custData] = await Promise.all([
      api.get<Record<string, unknown>>(`/ar/invoices/${params.id}`),
      api.get<{ data: unknown[] }>('/ar/customers?limit=100').catch(() => ({ data: [] })),
    ]);
    return { invoice, customers: custData.data };
  } catch {
    throw redirect(303, '/ar/invoices');
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const customerId = formData.get('customerId') as string;
    const invoiceNumber = formData.get('invoiceNumber') as string;
    const issueDate = formData.get('issueDate') as string;
    const dueDate = formData.get('dueDate') as string;
    const currency = formData.get('currency') as string;
    const notes = formData.get('notes') as string;

    if (!customerId) return fail(400, { error: 'Customer is required' });
    if (!invoiceNumber) return fail(400, { error: 'Invoice number is required' });
    if (!issueDate) return fail(400, { error: 'Issue date is required' });
    if (!dueDate) return fail(400, { error: 'Due date is required' });

    const lineItems: {
      description: string;
      quantity: string;
      unitPrice: string;
      taxRate?: string;
      sortOrder: number;
    }[] = [];
    let i = 0;
    while (formData.has(`lineDescription_${i}`)) {
      const description = formData.get(`lineDescription_${i}`) as string;
      const quantity = formData.get(`lineQuantity_${i}`) as string;
      const unitPrice = formData.get(`lineUnitPrice_${i}`) as string;
      const taxRate = formData.get(`lineTaxRate_${i}`) as string;
      if (description) {
        lineItems.push({
          description,
          quantity: quantity || '1',
          unitPrice: unitPrice || '0',
          taxRate: taxRate || undefined,
          sortOrder: i,
        });
      }
      i++;
    }

    try {
      const body: Record<string, unknown> = {
        customerId,
        invoiceNumber: invoiceNumber.trim(),
        issueDate,
        dueDate,
        currency: currency || 'USD',
        notes: notes || undefined,
      };
      if (lineItems.length > 0) body.lineItems = lineItems;

      await api.put(`/ar/invoices/${params.id}`, body);
      return redirect(303, `/ar/invoices/${params.id}`);
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
