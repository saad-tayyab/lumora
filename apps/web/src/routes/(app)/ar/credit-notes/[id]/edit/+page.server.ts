import { fail, redirect } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const [creditNote, custData] = await Promise.all([
      api.get<Record<string, unknown>>(`/ar/credit-notes/${params.id}`),
      api.get<{ data: unknown[] }>('/ar/customers?limit=100').catch(() => ({ data: [] })),
    ]);
    return { creditNote, customers: custData.data };
  } catch {
    throw redirect(303, '/ar/credit-notes');
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const customerId = formData.get('customerId') as string;
    const creditNoteNumber = formData.get('creditNoteNumber') as string;
    const issueDate = formData.get('issueDate') as string;
    const amount = formData.get('amount') as string;
    const reason = formData.get('reason') as string;
    const currency = formData.get('currency') as string;
    const notes = formData.get('notes') as string;

    if (!customerId) return fail(400, { error: 'Customer is required' });
    if (!creditNoteNumber) return fail(400, { error: 'Credit note number is required' });
    if (!issueDate) return fail(400, { error: 'Issue date is required' });
    if (!amount || parseFloat(amount) <= 0) return fail(400, { error: 'Valid amount is required' });
    if (!reason) return fail(400, { error: 'Reason is required' });

    try {
      const body: Record<string, unknown> = {
        customerId,
        creditNoteNumber: creditNoteNumber.trim(),
        issueDate,
        amount,
        reason: reason.trim(),
        currency: currency || 'USD',
      };
      if (notes) body.notes = notes.trim();

      await api.put(`/ar/credit-notes/${params.id}`, body);
      return redirect(303, `/ar/credit-notes/${params.id}`);
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
