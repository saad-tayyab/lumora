import { fail, redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/api';
import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/ar/customers?limit=100`, { credentials: 'include' });
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

      const res = await fetch(`${BACKEND_URL}/ar/credit-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to create credit note' }));
        return fail(400, { error: err.message || 'Failed to create credit note' });
      }

      const creditNote = await res.json();
      return redirect(303, `/ar/credit-notes/${creditNote.id}`);
    } catch {
      return fail(500, { error: 'Failed to connect to server' });
    }
  },
};
