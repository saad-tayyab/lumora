import { fail, redirect } from '@sveltejs/kit';
import { cashApi } from '$lib/api/cash';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const account = await cashApi.bankAccounts.get(params.id);
    return { account };
  } catch {
    throw redirect(303, '/cash/bank-accounts');
  }
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();

    const data = {
      bankName: formData.get('bankName') as string,
      accountName: formData.get('accountName') as string,
      accountNumber: formData.get('accountNumber') as string,
      routingNumber: (formData.get('routingNumber') as string) || undefined,
      accountType: (formData.get('accountType') as string) || undefined,
      currencyCode: (formData.get('currencyCode') as string) || undefined,
      currentBalance: (formData.get('currentBalance') as string) || undefined,
      availableBalance: (formData.get('availableBalance') as string) || undefined,
      isDefault: formData.get('isDefault') === 'on',
    };

    if (!data.bankName || !data.accountName || !data.accountNumber) {
      return fail(400, { error: 'Bank name, account name, and account number are required' });
    }

    try {
      await cashApi.bankAccounts.update(params.id, data);
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update bank account';
      return fail(400, { error: message });
    }
  },
};
