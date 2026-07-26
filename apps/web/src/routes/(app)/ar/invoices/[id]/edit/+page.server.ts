import { fail, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ params }) => {
  try {
    const [invRes, custRes] = await Promise.all([
      fetch(`${BACKEND_URL}/ar/invoices/${params.id}`, { credentials: 'include' }),
      fetch(`${BACKEND_URL}/ar/customers?limit=100`, { credentials: 'include' }),
    ]);
    if (invRes.status === 404) throw new Error('NOT_FOUND');
    if (!invRes.ok) throw new Error('Failed to fetch invoice');
    const invoice = await invRes.json();
    const custData = custRes.ok ? await custRes.json() : { data: [] };
    return { invoice, customers: custData.data };
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') {
      throw redirect(303, '/ar/invoices');
    }
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

      const res = await fetch(`${BACKEND_URL}/ar/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to update invoice' }));
        return fail(400, { error: err.message || 'Failed to update invoice' });
      }

      return redirect(303, `/ar/invoices/${params.id}`);
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
