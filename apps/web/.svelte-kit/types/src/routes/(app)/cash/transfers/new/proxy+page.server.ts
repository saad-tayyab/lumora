// @ts-nocheck
import { fail } from '@sveltejs/kit';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

export const load = async () => {
  try {
    const accounts = await cashApi.bankAccounts.list({ limit: 100 });
    return { accounts: accounts.data };
  } catch {
    return { accounts: [] };
  }
};

export const actions = {
  default: async ({ request }: import('./$types').RequestEvent) => {
    const formData = await request.formData();

    const data = {
      fromAccountId: formData.get('fromAccountId') as string,
      toAccountId: formData.get('toAccountId') as string,
      amount: formData.get('amount') as string,
      transferDate: formData.get('transferDate') as string,
      reference: (formData.get('reference') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    };

    if (!data.fromAccountId || !data.toAccountId || !data.amount || !data.transferDate) {
      return fail(400, { error: 'All fields are required' });
    }

    if (data.fromAccountId === data.toAccountId) {
      return fail(400, { error: 'Source and destination accounts must be different' });
    }

    try {
      await cashApi.transfers.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create transfer';
      return fail(400, { error: message });
    }
  },
};
;null as any as PageServerLoad;;null as any as Actions;