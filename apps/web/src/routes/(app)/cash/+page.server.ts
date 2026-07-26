import { type BankAccount, cashApi, type Transfer } from '$lib/api/cash';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [accountsResult, transfersResult, statementsResult, accounts] = await Promise.all([
      cashApi.bankAccounts.list({ limit: 1 }),
      cashApi.transfers.list({ limit: 1 }),
      cashApi.statements.list({ limit: 1 }),
      cashApi.bankAccounts.list({ limit: 10 }),
    ]);

    const recentTransfers = await cashApi.transfers.list({ limit: 5 });

    const totalBalance = accounts.data.reduce(
      (sum: number, a: { balance?: string }) => sum + parseFloat(a.balance || '0'),
      0,
    );

    return {
      accountCount: accountsResult.total,
      transferCount: transfersResult.total,
      statementCount: statementsResult.total,
      totalBalance: totalBalance.toFixed(2),
      bankAccounts: accounts.data as BankAccount[],
      recentTransfers: recentTransfers.data as Transfer[],
    };
  } catch {
    return {
      accountCount: 0,
      transferCount: 0,
      statementCount: 0,
      totalBalance: '0.00',
      bankAccounts: [] as BankAccount[],
      recentTransfers: [] as Transfer[],
    };
  }
};
