import { fail } from '@sveltejs/kit';
import { cashApi } from '$lib/api/cash';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const data = {
      name: formData.get('name') as string,
      accountNumber: formData.get('accountNumber') as string,
      bankName: formData.get('bankName') as string,
      routingNumber: (formData.get('routingNumber') as string) || undefined,
      currency: (formData.get('currency') as string) || 'USD',
      notes: (formData.get('notes') as string) || undefined,
    };

    if (!data.name || !data.accountNumber || !data.bankName) {
      return fail(400, { error: 'Account name, number, and bank name are required' });
    }

    try {
      await cashApi.bankAccounts.create(data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create bank account';
      return fail(400, { error: message });
    }
  },
};
