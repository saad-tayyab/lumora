import { cashApi } from '$lib/api/cash';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit')) || 20;
  const offset = Number(url.searchParams.get('offset')) || 0;
  const bankAccountId = url.searchParams.get('bankAccountId') || undefined;

  try {
    const [entriesResult, accountsResult] = await Promise.all([
      cashApi.reconciliation.list({ limit, offset, bankAccountId }),
      cashApi.bankAccounts.list({ limit: 100 }),
    ]);
    return {
      entries: entriesResult.data,
      total: entriesResult.total,
      accounts: accountsResult.data,
    };
  } catch {
    return { entries: [], total: 0, accounts: [] };
  }
};
