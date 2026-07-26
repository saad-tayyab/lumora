import { fail, redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/api';
import { financialApi } from '$lib/api/financial';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const response = await financialApi.accounts.list();
    return { accounts: response.data };
  } catch (_e: any) {
    return { accounts: [] };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const date = formData.get('date') as string;
    const description = formData.get('description') as string;

    const lineCount = Number(formData.get('lineCount') || 0);
    const lines: { accountId: string; description: string; debit: string; credit: string }[] = [];

    for (let i = 0; i < lineCount; i++) {
      const accountId = formData.get(`line_${i}_accountId`) as string;
      const lineDescription = formData.get(`line_${i}_description`) as string;
      const debit = (formData.get(`line_${i}_debit`) as string) || '0';
      const credit = (formData.get(`line_${i}_credit`) as string) || '0';

      if (accountId) {
        lines.push({
          accountId,
          description: lineDescription || '',
          debit,
          credit,
        });
      }
    }

    if (!date || !description || lines.length < 2) {
      return fail(400, {
        date,
        description,
        error: 'Date, description, and at least 2 lines are required',
      });
    }

    const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return fail(400, {
        date,
        description,
        error: `Debits (${totalDebit.toFixed(2)}) must equal credits (${totalCredit.toFixed(2)})`,
      });
    }

    try {
      await financialApi.journalEntries.create({ date, description, lines });
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : 'Failed to create journal entry';
      return fail(e.status || 500, { date, description, error: message });
    }

    redirect(303, '/financial/journal-entries');
  },
};
