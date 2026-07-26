import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const BASE_URL = 'http://localhost:4000';

export const load: PageServerLoad = async () => {
  try {
    const res = await fetch(`${BASE_URL}/ar/customers?limit=100`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch customers');
    const data = await res.json();
    return { customers: data.data };
  } catch {
    return { customers: [] };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
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

    if (lineItems.length === 0) {
      return fail(400, { error: 'At least one line item is required' });
    }

    try {
      const body = {
        customerId,
        invoiceNumber: invoiceNumber.trim(),
        issueDate,
        dueDate,
        currency: currency || 'USD',
        notes: notes || undefined,
        lineItems,
      };

      const res = await fetch(`${BASE_URL}/ar/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to create invoice' }));
        return fail(400, { error: err.message || 'Failed to create invoice' });
      }

      const invoice = await res.json();
      return redirect(303, `/ar/invoices/${invoice.id}`);
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
